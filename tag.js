(function () {
  'use strict';

  // 在 parse 時立刻捕捉 script src（async 環境下 currentScript 只在執行當下有效）
  var scriptSrc = (document.currentScript || {}).src || '';
  var baseUrl = scriptSrc.substring(0, scriptSrc.lastIndexOf('/'));

  // Phase 1: 直接指向靜態檔案
  // Phase 2: 改為 baseUrl + '/api/serve?p=' + placement
  function getCreativeUrl(placement) {
    return baseUrl + '/' + placement + '/index.html';
  }

  // 當 tag.js 跑在 GAM friendly iframe 裡（Standard rendering），
  // overlay 要掛到 publisher 頁面（window.top），不是 iframe 本身
  function getTargetBody() {
    try {
      if (window.top !== window &&
          window.top.document &&
          window.top.document.body) {
        return window.top.document.body;
      }
    } catch (e) {
      // cross-origin (SafeFrame) → fallback 到 iframe 本身
    }
    return document.body;
  }

  // ── Overlay 格式（1x1 蓋板、插頁）────────────────────────
  function renderOverlay(placement, width, height) {
    var body = getTargetBody();

    var overlay = document.createElement('div');
    overlay.style.cssText = [
      'position:fixed', 'top:0', 'left:0',
      'width:100%', 'height:100%',
      'z-index:2147483647',
      'background:rgba(0,0,0,0.75)',
      'display:flex', 'align-items:center', 'justify-content:center'
    ].join(';');

    var iframe = document.createElement('iframe');
    iframe.src = getCreativeUrl(placement);
    iframe.style.cssText = 'width:' + width + 'px;height:' + height + 'px;border:0;display:block;';
    iframe.setAttribute('scrolling', 'no');
    iframe.setAttribute('frameborder', '0');

    var closeBtn = document.createElement('button');
    closeBtn.innerHTML = '&times;';
    closeBtn.style.cssText = [
      'position:absolute', 'top:16px', 'right:16px',
      'width:36px', 'height:36px',
      'border-radius:50%', 'border:none',
      'background:#fff', 'color:#333',
      'font-size:22px', 'line-height:36px',
      'cursor:pointer', 'z-index:2147483647'
    ].join(';');
    closeBtn.onclick = function () {
      if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    };

    overlay.appendChild(iframe);
    overlay.appendChild(closeBtn);
    body.appendChild(overlay);
  }

  // ── Inline 格式（300x250、Banner）────────────────────────
  function renderInline(el, placement, width, height) {
    el.style.cssText = 'width:' + width + 'px;height:' + height + 'px;overflow:hidden;display:block;';

    var iframe = document.createElement('iframe');
    iframe.src = getCreativeUrl(placement);
    iframe.style.cssText = 'width:100%;height:100%;border:0;display:block;';
    iframe.setAttribute('scrolling', 'no');
    iframe.setAttribute('frameborder', '0');

    el.appendChild(iframe);
  }

  // ── 處理單一 slot ────────────────────────────────────────
  function processSlot(el) {
    var placement = el.getAttribute('data-ad-placement');
    if (!placement) return;

    var format = el.getAttribute('data-format') || 'overlay';
    var width  = parseInt(el.getAttribute('data-width'),  10) || 360;
    var height = parseInt(el.getAttribute('data-height'), 10) || 640;

    if (format === 'inline') {
      renderInline(el, placement, width, height);
    } else {
      // overlay / interstitial
      renderOverlay(placement, width, height);
    }
  }

  // ── 掃描頁面所有 [data-ad-placement] ────────────────────
  function init() {
    var slots = document.querySelectorAll('[data-ad-placement]');
    for (var i = 0; i < slots.length; i++) {
      processSlot(slots[i]);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
