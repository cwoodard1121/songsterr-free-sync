# Songsterr Free Sync

A [Tampermonkey](https://www.tampermonkey.net/) userscript that auto-dismisses the
Songsterr **"Upgrade to Plus for Original audio without sync pauses"** popup by
clicking the free *"continue with sync pauses"* option for you.

## Setup

1. **Install Tampermonkey** — [Chrome](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) · [Firefox](https://addons.mozilla.org/firefox/addon/tampermonkey/)

2. **Enable user scripts** (Chrome/Brave/Edge only — skips the *"no access to this page"* error):
   `chrome://extensions` → turn on **Developer mode** → Tampermonkey **Details** → **Allow User Scripts**.

3. **Add the script** — open [`songsterr-skip-sync-pause-popup.user.js`](https://raw.githubusercontent.com/cwoodard1121/songsterr-free-sync/main/songsterr-skip-sync-pause-popup.user.js) and click **Install** on the page Tampermonkey shows.

## Test it

Open a song on [songsterr.com](https://www.songsterr.com/) — the popup should vanish on its own.

To confirm it's running: press **F12** → **Console**, look for `[Songsterr-NoNag] script loaded`.

---

*Only dismisses the free option Songsterr already provides — does not unlock Plus or bypass payment.*
