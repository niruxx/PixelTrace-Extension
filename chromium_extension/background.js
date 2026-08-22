// MV3 service workers can't load multiple background scripts via the manifest
// (Chrome only accepts a single "service_worker" entry), so pull engines.js in manually.
importScripts("engines.js");

// Chrome doesn't expose a `browser` global; alias it to `chrome`, whose extension
// APIs have supported promises (in place of callbacks) since Chrome 99.
if (typeof browser === "undefined") {
  var browser = chrome;
}

const PARENT_ID = "ris-parent";
const NONE_ID = "ris-none";
const ALL_ID = "ris-all";
const SEP_ID = "ris-sep";

async function getSettings() {
  const stored = await browser.storage.sync.get(DEFAULT_SETTINGS);
  return {
    ...DEFAULT_SETTINGS,
    ...stored,
    engines: { ...DEFAULT_SETTINGS.engines, ...(stored.engines || {}) }
  };
}

function activeEnginesFrom(settings) {
  return settings.order.map((id) => ENGINES.find((e) => e.id === id)).filter((e) => e && settings.engines[e.id]);
}

async function rebuildMenus() {
  await browser.contextMenus.removeAll();
  const settings = await getSettings();
  const activeEngines = activeEnginesFrom(settings);

  if (activeEngines.length === 0) {
    browser.contextMenus.create({
      id: NONE_ID,
      title: "PixelSearch (no engines enabled — click to configure)",
      contexts: ["image"]
    });
    return;
  }

  // Chrome's contextMenus.create doesn't reliably accept a per-item `icons` property
  // across versions, so menu items go icon-less here (engine icons still show on the
  // options page, which renders them as plain <img> tags).
  browser.contextMenus.create({
    id: PARENT_ID,
    title: "PixelSearch",
    contexts: ["image"]
  });

  for (const engine of activeEngines) {
    browser.contextMenus.create({
      id: `ris-engine-${engine.id}`,
      parentId: PARENT_ID,
      title: engine.manualUpload ? `${engine.name} (paste URL there)` : engine.name,
      contexts: ["image"]
    });
  }

  if (activeEngines.length > 1) {
    browser.contextMenus.create({ id: SEP_ID, type: "separator", parentId: PARENT_ID, contexts: ["image"] });
    browser.contextMenus.create({
      id: ALL_ID,
      parentId: PARENT_ID,
      title: "Search on all enabled engines",
      contexts: ["image"]
    });
  }
}

function notifyUnsupportedImage() {
  browser.notifications.create({
    type: "basic",
    iconUrl: browser.runtime.getURL("icons/icon-128.png"),
    title: "PixelSearch",
    message:
      "This image can't be reverse-searched directly (it's an embedded or data image). Save the image and upload it to the search engine manually instead."
  });
}

// data:/blob: URLs aren't fetchable by the search engine's server, so they only work for
// engines the user has to paste/upload into manually anyway (engine.manualUpload).
function isFetchableUrl(url) {
  return !!url && !url.startsWith("data:") && !url.startsWith("blob:");
}

browser.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === NONE_ID) {
    browser.runtime.openOptionsPage();
    return;
  }

  const imageUrl = info.srcUrl;
  if (!imageUrl) return;

  const settings = await getSettings();
  const tabIndex = tab ? tab.index + 1 : undefined;
  const fetchable = isFetchableUrl(imageUrl);

  if (info.menuItemId === ALL_ID) {
    let skipped = false;
    for (const engine of activeEnginesFrom(settings)) {
      if (!engine.manualUpload && !fetchable) {
        skipped = true;
        continue;
      }
      browser.tabs.create({ url: engine.buildUrl(imageUrl), active: false, index: tabIndex });
    }
    if (skipped) notifyUnsupportedImage();
    return;
  }

  const match = /^ris-engine-(.+)$/.exec(info.menuItemId);
  if (match) {
    const engine = ENGINES.find((e) => e.id === match[1]);
    if (!engine) return;

    if (!engine.manualUpload && !fetchable) {
      notifyUnsupportedImage();
      return;
    }

    browser.tabs.create({
      url: engine.buildUrl(imageUrl),
      active: !settings.openInBackground,
      index: tabIndex
    });
  }
});

browser.action.onClicked.addListener(() => browser.runtime.openOptionsPage());

browser.runtime.onInstalled.addListener(rebuildMenus);
browser.runtime.onStartup.addListener(rebuildMenus);
browser.storage.onChanged.addListener(rebuildMenus);
