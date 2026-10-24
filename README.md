# Songsterr Free Sync

A [Tampermonkey](https://www.tampermonkey.net/) userscript that stops the
Songsterr **"Upgrade to Plus for Original audio without sync pauses"** popup from
ever showing. It takes the free *"continue with sync pauses"* option the instant
Songsterr tries to open the popup, before it's drawn. If that ever breaks, it
falls back to clicking the popup away.

## Setup

1. **Install Tampermonkey** — [Chrome](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) · [Firefox](https://addons.mozilla.org/firefox/addon/tampermonkey/)

2. **Enable user scripts** (Chrome/Brave/Edge only — skips the *"no access to this page"* error):
   `chrome://extensions` → turn on **Developer mode** → Tampermonkey **Details** → **Allow User Scripts**.

3. **Add the script** — open [`songsterr-skip-sync-pause-popup.user.js`](https://raw.githubusercontent.com/cwoodard1121/songsterr-free-sync/main/songsterr-skip-sync-pause-popup.user.js) and click **Install** on the page Tampermonkey shows.

## Test it

Open a song on [songsterr.com](https://www.songsterr.com/) and play it with original audio. The popup should never appear.

To confirm it's running: press **F12** → **Console**, look for `[Songsterr-NoNag] store hook installed`, then `blocked sync-pause popup` each time it would have appeared.

---

*Only dismisses the free option Songsterr already provides — does not unlock Plus or bypass payment.*
