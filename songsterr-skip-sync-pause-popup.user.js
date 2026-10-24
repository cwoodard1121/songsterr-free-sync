// ==UserScript==
// @name         Songsterr – Skip "Original Audio" Sync-Pause Popup
// @namespace    https://github.com/songsterr-tweaks
// @version      2.0.0
// @description  Auto-dismisses the "Upgrade to Plus for Original audio without sync pauses" popup on Songsterr by choosing the free "continue with sync pauses" option, every time it appears, and keeps playback going.
// @author       you
// @match        https://www.songsterr.com/*
// @match        https://songsterr.com/*
// @updateURL    https://raw.githubusercontent.com/cwoodard1121/songsterr-free-sync/main/songsterr-skip-sync-pause-popup.user.js
// @downloadURL  https://raw.githubusercontent.com/cwoodard1121/songsterr-free-sync/main/songsterr-skip-sync-pause-popup.user.js
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const TAG = '[Songsterr-NoNag]';
  console.log(TAG, 'script loaded on', location.href);

  // Phrases that identify the upgrade nag. Matched against text, not on the
  // build-hashed class names (w_eHuW_*, _2e9mvq_*) which change every deploy.
  const NAG_TEXT = /without sync pauses|upgrade to plus for original audio/i;
  const CONTINUE_TEXT = /continue with sync pauses/i;

  // The popup comes back every ~30s while original audio plays, sometimes as
  // the same element. So rather than marking elements as done, we click
  // whenever a nag is visible, at most once per RETRY_MS.
  const RETRY_MS = 700;
  let lastClick = 0;

  // Whether playback was running when the nag showed up, so we can resume it
  // if the popup (or dismissing it) paused the player.
  let wasPlaying = null;

  function isVisible(el) {
    if (!el.isConnected) return false;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }

  function findNag() {
    const dialogs = document.querySelectorAll('form[role="dialog"], [role="dialog"], dialog');
    for (const el of dialogs) {
      if (NAG_TEXT.test(el.textContent || '') && isVisible(el)) return el;
    }
    return null;
  }

  // The play button's title reads "Pause ..." while playing, "Play ..." while paused.
  function playButton() {
    return document.getElementById('control-play');
  }
  function isPlaying() {
    const btn = playButton();
    return !!btn && /^pause/i.test(btn.title || btn.getAttribute('aria-label') || '');
  }

  // Dispatch the same event sequence a real mouse click produces, since the app
  // may listen for pointer/mouse events rather than only 'click'.
  function realClick(el) {
    const r = el.getBoundingClientRect();
    const init = {
      bubbles: true, cancelable: true, composed: true, view: window,
      clientX: r.left + r.width / 2, clientY: r.top + r.height / 2,
      button: 0, buttons: 1, pointerId: 1, pointerType: 'mouse', isPrimary: true,
    };
    for (const t of ['pointerover', 'pointerdown', 'mousedown', 'pointerup', 'mouseup']) {
      const Ctor = t.startsWith('pointer') ? PointerEvent : MouseEvent;
      el.dispatchEvent(new Ctor(t, init));
    }
    el.dispatchEvent(new MouseEvent('click', { ...init, buttons: 0 }));
  }

  function check() {
    const nag = findNag();

    if (!nag) {
      // Popup gone: if it interrupted playback, start it again.
      if (wasPlaying && !isPlaying() && playButton()) {
        console.log(TAG, 'resuming playback');
        realClick(playButton());
      }
      wasPlaying = null;
      return;
    }

    if (wasPlaying === null) wasPlaying = isPlaying();

    const now = Date.now();
    if (now - lastClick < RETRY_MS) return;

    // Click the free "continue with sync pauses" link and let the app close
    // its own modal (removing it ourselves leaves the page blurred).
    for (const link of nag.querySelectorAll('a, button')) {
      if (CONTINUE_TEXT.test(link.textContent || '')) {
        lastClick = now;
        console.log(TAG, 'clicked "continue with sync pauses"');
        realClick(link);
        return;
      }
    }
  }

  // React injects the popup after load; react to DOM changes (throttled, since
  // playback mutates the DOM constantly) and poll as a backstop.
  let pending = false;
  const observer = new MutationObserver(() => {
    if (pending) return;
    pending = true;
    setTimeout(() => { pending = false; check(); }, 100);
  });

  function start() {
    observer.observe(document.documentElement, { childList: true, subtree: true });
    setInterval(check, 500);
    check();
  }

  if (document.body) {
    start();
  } else {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  }
})();
