// Shared engine definitions, loaded by both the background script and the options page.
// Each engine builds a search URL from a public image URL (no host permissions required).
// `icon` points at Firefox-only contextMenus item icons (16/32px) under icons/engines/.
// `manualUpload: true` marks engines whose site has no URL-based search endpoint, so the
// link only opens the engine's image-search page — the user still has to paste/upload there.
const ENGINES = [
  {
    id: "google",
    name: "Google Lens",
    icon: { 16: "icons/engines/google-16.png", 32: "icons/engines/google-32.png" },
    buildUrl: (url) => `https://lens.google.com/uploadbyurl?url=${encodeURIComponent(url)}`
  },
  {
    id: "bing",
    name: "Bing Visual Search",
    icon: { 16: "icons/engines/bing-16.png", 32: "icons/engines/bing-32.png" },
    buildUrl: (url) =>
      `https://www.bing.com/images/search?view=detailv2&iss=sbi&form=SBIIRP&sbisrc=UrlPaste&q=imgurl:${encodeURIComponent(url)}`
  },
  {
    id: "yandex",
    name: "Yandex Images",
    icon: { 16: "icons/engines/yandex-16.png", 32: "icons/engines/yandex-32.png" },
    buildUrl: (url) => `https://yandex.com/images/search?rpt=imageview&url=${encodeURIComponent(url)}`
  },
  {
    id: "tineye",
    name: "TinEye",
    icon: { 16: "icons/engines/tineye-16.png", 32: "icons/engines/tineye-32.png" },
    buildUrl: (url) => `https://www.tineye.com/search?url=${encodeURIComponent(url)}`
  },
  {
    id: "baidu",
    name: "Baidu Image Search",
    icon: { 16: "icons/engines/baidu-16.png", 32: "icons/engines/baidu-32.png" },
    manualUpload: true,
    buildUrl: () => `https://graph.baidu.com/pcpage/index?tpl_from=pc`
  },
  {
    id: "sogou",
    name: "Sogou Images",
    icon: { 16: "icons/engines/sogou-16.png", 32: "icons/engines/sogou-32.png" },
    buildUrl: (url) => `https://pic.sogou.com/ris?query=${encodeURIComponent(url)}&flag=1&drag=0`
  },
  {
    id: "lenso",
    name: "Lenso.ai",
    icon: { 16: "icons/engines/lenso-16.png", 32: "icons/engines/lenso-32.png" },
    buildUrl: (url) => `https://lenso.ai/en/search-by-url?url=${encodeURIComponent(url)}`
  },
  {
    id: "shutterstock",
    name: "Shutterstock",
    icon: { 16: "icons/engines/shutterstock-16.png", 32: "icons/engines/shutterstock-32.png" },
    manualUpload: true,
    buildUrl: () => `https://www.shutterstock.com/images`
  }
];

const DEFAULT_SETTINGS = {
  engines: {
    google: true,
    bing: true,
    yandex: true,
    tineye: true,
    baidu: true,
    sogou: true,
    lenso: true,
    shutterstock: true
  },
  order: ENGINES.map((engine) => engine.id),
  openInBackground: true
};
