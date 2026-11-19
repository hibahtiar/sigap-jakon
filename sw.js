/* SIGAP Jakon — service worker.
   Menyimpan kerangka aplikasi agar terbuka instan. Data (POST ke Apps Script) TIDAK pernah disimpan di sini. */
var VERSI = 'sigap-v1';
var KERANGKA = ['./', './index.html', './config.js', './manifest.webmanifest',
  './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png', './icons/favicon-32.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSI).then(function (c) { return c.addAll(KERANGKA); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== VERSI; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;                       // panggilan API lewat POST → langsung ke jaringan
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;         // font, Apps Script, dll. → biarkan
  // Tampilkan dari simpanan dulu, lalu perbarui di belakang layar (versi baru terpakai saat dibuka berikutnya).
  e.respondWith(caches.open(VERSI).then(function (c) {
    return c.match(req).then(function (lama) {
      var baru = fetch(req).then(function (r) { if (r && r.ok) c.put(req, r.clone()); return r; }).catch(function () { return lama; });
      return lama || baru;
    });
  }));
});
