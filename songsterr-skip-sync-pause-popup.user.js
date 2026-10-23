// ==UserScript==
// @name         Songsterr – Skip "Original Audio" Sync-Pause Popup
// @namespace    https://github.com/songsterr-tweaks
// @version      1.4.1
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

  // Temporary: log whatever is still blurring the page after the click.
  function diagnose() {
    const out = [];
    document.querySelectorAll('*').forEach((e) => {
      const cs = getComputedStyle(e);
      if (/blur/.test(cs.filter + cs.backdropFilter)) {
        const r = e.getBoundingClientRect();
        out.push(`${e.tagName}.${e.className} filter=${cs.filter} backdrop=${cs.backdropFilter} ${Math.round(r.width)}x${Math.round(r.height)}`);
      }
    });
    console.log(TAG, 'DIAG blurred:', out.length ? out.join(' | ') : 'none',
      '| html.class=' + document.documentElement.className,
      '| body.class=' + document.body.className,
      '| dialogs=' + document.querySelectorAll('[role="dialog"], dialog').length);
  }

  function dismiss() {
    const nag = findNag();
    if (!nag) return false;
    handled.add(nag);

    // Just click the free "continue with sync pauses" link inside the nag and
    // let the app close its own modal (removing it ourselves leaves the blur).
    for (const link of nag.querySelectorAll('a, button')) {
      if (CONTINUE_TEXT.test(link.textContent || '')) {
        console.log(TAG, 'clicked "continue with sync pauses" – popup dismissed');
        link.click();
        setTimeout(diagnose, 2000);
        return true;
      }
    }
    return false;
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
