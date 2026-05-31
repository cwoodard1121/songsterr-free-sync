# Songsterr Free Sync

A small [Tampermonkey](https://www.tampermonkey.net/) userscript that automatically
dismisses the Songsterr popup that reads:

> **Upgrade to Plus for Original audio without sync pauses**
> *Or switch to Synth audio*
> Or [continue with sync pauses]

Instead of nagging you, the script clicks the free **"continue with sync pauses"**
option for you, so playback just continues. If Songsterr changes that popup's
layout, the script falls back to removing the dialog entirely and re-enabling
page scrolling.

The script matches the popup by its **text** (not by CSS class names), because
Songsterr's class names are build-hashed and change on every deploy. This keeps
the script working across site redesigns.

---

## 1. Install Tampermonkey

1. Go to the [Tampermonkey website](https://www.tampermonkey.net/) and install
   the extension for your browser:
   - [Chrome / Brave / Edge (Chrome Web Store)](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
   - [Firefox](https://addons.mozilla.org/firefox/addon/tampermonkey/)
2. After installing, you should see the Tampermonkey icon in your browser toolbar.

---

## 2. Enable User Scripts in Chrome

> **Required on Chrome / Brave / Edge.** Since Chrome's Manifest V3 change,
> extensions can't run user scripts until you explicitly allow it. If you skip
> this step you'll see **"Tampermonkey has no access to this page"** and nothing
> will happen.

1. Open `chrome://extensions` in your address bar.
2. Turn on **Developer mode** (toggle in the top-right corner).
3. Find **Tampermonkey** → click **Details**.
4. Turn on **Allow User Scripts**.
5. Reload any open Songsterr tabs afterward.

*(On Firefox this step isn't needed — user scripts work out of the box.)*

---

## 3. Add the Script

**Option A — Install from this repo (easiest):**

1. Open the raw script file:
   [`songsterr-skip-sync-pause-popup.user.js`](https://raw.githubusercontent.com/cwoodard1121/songsterr-free-sync/main/songsterr-skip-sync-pause-popup.user.js)
2. Because the filename ends in `.user.js`, Tampermonkey will detect it and show
   an **install page**. Click **Install**.

**Option B — Paste manually:**

1. Click the Tampermonkey toolbar icon → **Create a new script…**
2. Delete the template, then paste in the full contents of
   `songsterr-skip-sync-pause-popup.user.js`.
3. Press **Ctrl + S** (or **File → Save**).

---

## 4. Test It

1. Open any tab page on [songsterr.com](https://www.songsterr.com/) and start
   playback so the upgrade popup would normally appear.
2. The popup should dismiss itself automatically and playback continues with
   sync pauses (the free mode).

### Confirm the script is running

1. Press **F12** to open DevTools → click the **Console** tab.
2. You should see:
   ```
   [Songsterr-NoNag] script loaded on https://www.songsterr.com/...
   ```
3. When it dismisses the popup, you'll also see one of:
   ```
   [Songsterr-NoNag] clicked "continue with sync pauses" – popup dismissed
   [Songsterr-NoNag] removed upgrade nag dialog (fallback path)
   ```

If you **don't** see the `script loaded` line, the script isn't injecting —
re-check **Step 2** (enable user scripts). You can also check the Tampermonkey
toolbar icon: it shows a small red badge with the number of active scripts on
the current page.

---

## How It Works

- Runs at `document-start` on `songsterr.com` and `www.songsterr.com`.
- A `MutationObserver` watches the page, since the popup is injected by
  Songsterr's React app after the page loads.
- When the popup appears, the script clicks the free **"continue with sync
  pauses"** link (matched by text via a case-insensitive regex).
- Fallback: if that link isn't found, it locates the `role="dialog"` element
  containing the nag text, removes it, and clears any leftover scroll lock /
  full-screen overlay.

## Disclaimer

This script only dismisses a popup by choosing the **free** option Songsterr
already provides. It does **not** unlock Plus features, bypass payment, or alter
audio. It's purely a convenience tweak to stop the repeated nag.
