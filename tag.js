(function () {
  'use strict';

  // 1. 找到這個 script tag，取得 placement ID 和 base URL
  var script = document.currentScript || (function () {
    var tags = document.getElementsByTagName('script');
    return tags[tags.length - 1];
  })();

  var src = script.src;
  var baseUrl = src.substring(0, src.lastIndexOf('/'));

  var params = {};
  var query = src.indexOf('?') !== -1 ? src.split('?')[1] : '';
  query.split('&').forEach(function (pair) {
    var kv = pair.split('=');
    if (kv[0]) params[kv[0]] = decodeURIComponent(kv[1] || '');
  });

  var placement = params.p || 'ad1';

  // Phase 1: 靜態 URL（Phase 2 改為 /api/serve?p=xxx）
  var creativeUrl = baseUrl + '/' + placement + '/index.html';

  // 2. 建立全頁 overlay
  var overlay = document.createElement('div');
  overlay.style.cssText = [
    'position:fixed', 'top:0', 'left:0',
    'width:100%', 'height:100%',
    'z-index:2147483647',
    'background:rgba(0,0,0,0.75)',
    'display:flex', 'align-items:center', 'justify-content:center'
  ].join(';');

  // 3. Creative iframe（iframe src = 完整 HTML 頁面）
  var iframe = document.createElement('iframe');
  iframe.src = creativeUrl;
  iframe.style.cssText = 'width:360px;height:640px;border:0;display:block;';
  iframe.setAttribute('scrolling', 'no');
  iframe.setAttribute('frameborder', '0');

  // 4. 關閉按鈕
  var closeBtn = document.createElement('button');
  closeBtn.innerHTML = '&times;';
  closeBtn.style.cssText = [
    'position:absolute', 'top:16px', 'right:16px',
    'width:36px', 'height:36px',
    'border-radius:50%', 'border:none',
    'background:#fff', 'color:#333',
    'font-size:22px', 'line-height:1',
    'cursor:pointer', 'z-index:2147483647'
  ].join(';');
  closeBtn.onclick = function () {
    if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
  };

  overlay.appendChild(iframe);
  overlay.appendChild(closeBtn);

  // 5. 掛到 DOM（等 body ready）
  function mount() { document.body.appendChild(overlay); }
  if (document.body) { mount(); }
  else { document.addEventListener('DOMContentLoaded', mount); }
})();
