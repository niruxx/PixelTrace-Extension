<div align="center">

<img src="firefox_extension/icons/icon-128.png" width="96" height="96" alt="PixelSearch icon" />

# 🔍 PixelSearch

**Right-click any image → search it on Google Lens, Bing, Yandex, TinEye, Baidu, Sogou, Lenso.ai, or Shutterstock.**

No uploads. No accounts. No page reload. **Zero host permissions.**

![Manifest V3](https://img.shields.io/badge/manifest-v3-4c6ef5?style=flat-square)
![Firefox](https://img.shields.io/badge/firefox-140%2B-ff9500?style=flat-square)
![Chrome](https://img.shields.io/badge/chrome-99%2B-4285f4?style=flat-square)
![Host permissions](https://img.shields.io/badge/host%20permissions-zero-2ea043?style=flat-square)
![Tracking](https://img.shields.io/badge/analytics%20%2F%20tracking-none-2ea043?style=flat-square)

</div>

---

## 🤔 Why this exists

Most "reverse image search" extensions in the add-on stores ask for **"Access your data for all websites"** — meaning they can read and modify *every page you visit*, not just the image you right-clicked. Some inject scripts everywhere, some phone home with telemetry, and most ship as minified blobs you can't easily audit before trusting them with your browsing.

This extension does exactly one job and nothing else:

- 🚫 **No host permissions** — it never asks to read or change anything on any website.
- 🚫 **No content scripts** — it doesn't run any code inside the pages you visit.
- 🚫 **No analytics, no telemetry, no remote code** — it never phones home.
- ✅ **~300 lines of readable JS, total**, no bundler, no minification, no dependencies — open `background.js` and `engines.js` and you've read the core of it.
- ✅ It only ever does one thing on click: build a URL and open a new tab, using the browser's own `contextMenus` API.

If you don't trust it either — good instinct. Read the source (it's short), then build it yourself with the steps below.

---

## ✨ Features

- 🖱️ Adds a **PixelSearch** submenu to the image right-click menu (with a branded icon per engine in Firefox).
- 🔁 **"Search on all enabled engines"** shortcut to fan out to every engine you've turned on at once.
- ⚙️ Settings page to enable/disable engines, reorder them, and choose whether results open in a background tab.
- 🧠 Uses each engine's public *search-by-URL* endpoint directly — no fetching or re-uploading of image data through the extension itself.
- 🛡️ Gracefully handles images that can't be searched by URL (e.g. `data:` / `blob:` embedded images) with a notification instead of a broken tab.

## 🧭 Supported engines

| Engine | Search by URL | Notes |
| --- | :---: | --- |
| 🔵 Google Lens | ✅ | |
| 🌊 Bing Visual Search | ✅ | |
| 🔴 Yandex Images | ✅ | |
| 🟢 TinEye | ✅ | |
| 🟠 Sogou Images | ✅ | |
| 🟣 Lenso.ai | ✅ | |
| 🔷 Baidu Image Search | ⚠️ manual | No URL-based search endpoint — opens Baidu's image search page for you to paste/upload the image. |
| 🔴 Shutterstock | ⚠️ manual | Finds visually similar *stock photos* in Shutterstock's own catalog, not general image provenance. Upload-only, so it opens the search page for you. |

---

## 🌐 Two builds, one codebase

Firefox and Chrome disagree on a few Manifest V3 basics — how a background script loads (`scripts` array vs. a single `service_worker`), whether a `browser` global exists, and how strict `contextMenus.create()` is about extra fields. Rather than paper over that with a bundler, this repo ships two small, independent, fully self-contained extension folders:

```
firefox_extension/    Loadable as-is in Firefox — background runs as a scripts-array event page,
                       uses the native `browser.*` API, and keeps per-item context-menu icons.
chromium_extension/   Loadable as-is in Chrome/Edge/Brave/etc. — background is a single
                       service_worker (loads engines.js via importScripts), polyfills
                       `browser` to `chrome`, and drops context-menu icons (Chrome's
                       contextMenus.create() rejects the `icons` field on many versions).
```

Each folder has its own `manifest.json`, `background.js`, `engines.js`, `options/`, and `icons/` — there's no shared build step, so what you load in the browser is exactly the source you're reading.

---

## 📦 Install

### Firefox

**Temporary install (fastest, for trying it out):**

1. Open `about:debugging#/runtime/this-firefox` in Firefox.
2. Click **Load Temporary Add-on…**.
3. Select `firefox_extension/manifest.json`.
4. Right-click any image on a webpage to see the new menu. 🎉

> ⚠️ Temporary add-ons are removed when Firefox restarts — use this for testing, not daily use.

**Build it yourself:**

```bash
cd firefox_extension

# 1. Validate the extension (manifest + source checks)
npx web-ext lint

# 2. Try it in a real Firefox profile with hot reload
npx web-ext run

# 3. Package it into a .zip ready for AMO submission or self-signing
npx web-ext build
```

`web-ext build` drops a versioned `.zip` in `firefox_extension/web-ext-artifacts/`.

**Permanent installation:** Firefox only runs *signed* extensions outside of temporary installs.

- **Self-distribute:** submit the `.zip` from `web-ext build` to [AMO's "Submit a New Add-on"](https://addons.mozilla.org/developers/) for signing (you can list it unlisted/private), then install the signed `.xpi` it hands back.
- **Nightly / Developer Edition / ESR:** set `xpinstall.signatures.required` to `false` in `about:config` and load the unsigned build directly.

### Chrome (and Chromium-based browsers: Edge, Brave, etc.)

1. Open `chrome://extensions`.
2. Enable **Developer mode** (top right).
3. Click **Load unpacked** and select the `chromium_extension/` folder.
4. Right-click any image on a webpage to see the new menu. 🎉

To package a `.zip` for the Chrome Web Store, use **Pack extension** in `chrome://extensions`, pointing at `chromium_extension/`, or `zip -r pixelsearch-chromium.zip .` from inside that folder.

---

## 📁 Project layout

```
firefox_extension/    Firefox MV3 build (background scripts array, browser.* API, menu icons)
chromium_extension/   Chrome/Chromium MV3 build (service_worker background, chrome.* API)

Each build folder contains:
  manifest.json        Browser-specific MV3 manifest
  engines.js            Shared engine list + default settings (background & options both load this)
  background.js         Builds the context menu from settings, opens result tabs on click
  options/               Settings UI — enable/reorder engines, background-tab toggle
  icons/                  Extension icon (16/32/48/128px) and per-engine badge icons (16/32px)
```

## 🔐 Permissions, explained

| Permission | Why it's needed |
| --- | --- |
| `contextMenus` | To add the right-click menu items. |
| `storage` | To remember which engines you've enabled and their order. |
| `notifications` | To tell you when an image can't be reverse-searched by URL. |

No `<all_urls>`, no `activeTab`, no `tabs` content access, no host permissions of any kind — in either build.
