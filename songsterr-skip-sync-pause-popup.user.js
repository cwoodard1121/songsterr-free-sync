// ==UserScript==
// @name         Songsterr – Skip "Original Audio" Sync-Pause Popup
// @namespace    https://github.com/songsterr-tweaks
// @version      1.1.0
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

  function dismiss() {
    // 1) Preferred: locate the popup and click its free "continue with sync
    //    pauses" link, which is exactly what Songsterr wants you to click.
    const links = document.querySelectorAll('a, button');
    for (const link of links) {
      if (CONTINUE_TEXT.test(link.textContent || '')) {
        // Neutralize navigation: the href points back at the current page,
        // so just let the SPA handler close the modal without a full reload.
        console.log(TAG, 'clicked "continue with sync pauses" – popup dismissed');
        link.click();
        cleanup();
        return true;
      }
    }

    // 2) Fallback: no "continue" link found (layout changed) — find the nag
    //    dialog by its text and remove it outright.
    const candidates = document.querySelectorAll(
      'form[role="dialog"], [role="dialog"], dialog'
    );
    for (const el of candidates) {
      if (NAG_TEXT.test(el.textContent || '')) {
        console.log(TAG, 'removed upgrade nag dialog (fallback path)');
        const root = findDialogRoot(el) || el;
        root.remove();
        cleanup();
        return true;
      }
    }

    return false;
  }

  function cleanup() {
    // Re-enable scrolling if the modal locked the page.
    document.documentElement.style.overflow = '';
    document.body && (document.body.style.overflow = '');
    // Remove any leftover full-screen dimming overlay.
    document
      .querySelectorAll('[class*="overlay"]')
      .forEach((o) => {
        const r = o.getBoundingClientRect();
        if (r.width >= window.innerWidth * 0.9 && r.height >= window.innerHeight * 0.9) {
          o.style.pointerEvents = 'none';
        }
      });
  }

  // Watch for the popup appearing (it's injected by the React app after load).
  const observer = new MutationObserver(() => dismiss());

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
