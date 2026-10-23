// ==UserScript==
// @name         Songsterr – Skip "Original Audio" Sync-Pause Popup
// @namespace    https://github.com/songsterr-tweaks
// @version      1.3.0
// @description  Auto-dismisses the "Upgrade to Plus for Original audio without sync pauses" popup on Songsterr by choosing the free "continue with sync pauses" option. No more nag.
// @author       you
// @match        https://www.songsterr.com/*
// @match        https://songsterr.com/*
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

  function findDialogRoot(node) {
    // Walk up to the dialog/form container so we remove the whole popup,
    // not just the inner paragraph.
    let el = node;
    while (el && el !== document.body) {
      if (
        el.matches &&
        el.matches('form[role="dialog"], [role="dialog"], dialog')
      ) {
        return el;
      }
      el = el.parentElement;
    }
    return null;
  }

  // Elements we've already acted on. The observer fires on every DOM mutation
  // (playback scrolling mutates constantly), so without this we'd re-click the
  // button over and over and stall the score.
  const handled = new WeakSet();

  function findNag() {
    const dialogs = document.querySelectorAll(
      'form[role="dialog"], [role="dialog"], dialog'
    );
    for (const el of dialogs) {
      if (!handled.has(el) && NAG_TEXT.test(el.textContent || '')) return el;
    }
    return null;
  }

  function dismiss() {
    const nag = findNag();
    if (!nag) return false;
    handled.add(nag);

    // 1) Preferred: click the free "continue with sync pauses" link inside the
    //    nag only (never a same-named control elsewhere on the page).
    for (const link of nag.querySelectorAll('a, button')) {
      if (CONTINUE_TEXT.test(link.textContent || '')) {
        console.log(TAG, 'clicked "continue with sync pauses" – popup dismissed');
        link.click();
        // If the app didn't close it, remove it ourselves.
        setTimeout(() => {
          if (nag.isConnected) (findDialogRoot(nag) || nag).remove();
          cleanup();
        }, 300);
        setTimeout(cleanup, 1500); // the app may re-apply the blur after closing
        return true;
      }
    }

    // 2) Fallback: no "continue" link found (layout changed) — remove the dialog.
    console.log(TAG, 'removed upgrade nag dialog (fallback path)');
    (findDialogRoot(nag) || nag).remove();
    cleanup();
    return true;
  }

  function cleanup() {
    // Re-enable scrolling if the modal locked the page.
    document.documentElement.style.overflow = '';
    document.body && (document.body.style.overflow = '');
    // Clear any large leftover blur (page wrapper or backdrop) from the modal.
    document.querySelectorAll('*').forEach((e) => {
      const cs = getComputedStyle(e);
      if (!/blur/.test(cs.filter + cs.backdropFilter)) return;
      const r = e.getBoundingClientRect();
      if (r.width >= window.innerWidth * 0.5 && r.height >= window.innerHeight * 0.5) {
        e.style.setProperty('filter', 'none', 'important');
        e.style.setProperty('backdrop-filter', 'none', 'important');
        console.log(TAG, 'cleared blur on', e.tagName, e.className);
      }
    });
    // Disable only fixed full-screen dimming backdrops. Never touch scrollable
    // containers (the score view), or wheel scrolling dies.
    document.querySelectorAll('[class*="overlay"]').forEach((o) => {
      const cs = getComputedStyle(o);
      if (cs.position !== 'fixed' || /auto|scroll/.test(cs.overflowY)) return;
      const r = o.getBoundingClientRect();
      if (r.width >= window.innerWidth * 0.9 && r.height >= window.innerHeight * 0.9) {
        o.style.pointerEvents = 'none';
      }
    });
  }

  // Watch for the popup appearing (it's injected by the React app after load).
  let pending = false;
  const observer = new MutationObserver(() => {
    if (pending) return;
    pending = true;
    setTimeout(() => { pending = false; dismiss(); }, 100); // throttle
  });

  function start() {
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
    dismiss(); // in case it's already there
  }

  if (document.body) {
    start();
  } else {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  }
})();
