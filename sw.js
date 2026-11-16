// アプリ版（bundle.py --pwa）の保存係。ゲームは1つの index.html にすべて入っている。
// - 起動：端末に保存した版をすぐ出す（電波が無くても遊べる）。保存が無いときだけネットから取る
// - 更新：このファイルの版の名前（bundle.py が書き込む）が変わると、端末が新しい版を取りにいき、入れ替える。
//   入れ替わるとゲームの画面に「新しい版があります」が出る
var VERSION = '2026-11-16 15:05 4cbf368';
var CACHE = 'mayoi-' + VERSION;
var FILES = ['./', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', function (ev) {
  ev.waitUntil(caches.open(CACHE).then(function (c) {
    return c.addAll(FILES.map(function (f) { return new Request(f, { cache: 'reload' }); }));
  }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (ev) {
  ev.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k.indexOf('mayoi-') === 0 && k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (ev) {
  var req = ev.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return; // 文字（Google Fonts）などはそのままネットへ
  var key = req.mode === 'navigate' ? './' : req;
  ev.respondWith(caches.open(CACHE).then(function (c) {
    return c.match(key, { ignoreSearch: true }).then(function (hit) { return hit || fetch(req); });
  }));
});
