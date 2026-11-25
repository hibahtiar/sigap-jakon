/* SIGAP Jakon 2.0 — service worker.
   Simpanan hanya berawalan "sigap-jakon-" (plus "sigap-v1" milik versi 1): simpanan aplikasi lain di alamat yang sama
   (LENSA PK, Monitor SPPG, MyTagihan Desa) tidak pernah disentuh. Data (POST ke server) TIDAK pernah disimpan di sini. */
var SIMPANAN = 'sigap-jakon-v2.4.3';
var KERANGKA = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png', './icons/favicon-32.png', './config.js'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(SIMPANAN).then(function (c) {
    return Promise.all(KERANGKA.map(function (u) { return c.add(u).catch(function () { }); }));
  }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return (k.indexOf('sigap-jakon-') === 0 && k !== SIMPANAN) || k === 'sigap-v1'; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;                    // panggilan server lewat POST → langsung ke jaringan
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;      // font, Apps Script → biarkan
  // jaringan dulu (versi baru langsung terpakai), simpanan bila offline
  e.respondWith(fetch(req).then(function (r) {
    if (r && r.ok) { var salin = r.clone(); caches.open(SIMPANAN).then(function (c) { c.put(req, salin); }); }
    return r;
  }).catch(function () { return caches.match(req).then(function (x) { return x || caches.match('./index.html'); }); }));
});
