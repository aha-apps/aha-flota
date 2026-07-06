// sw.js — Offline-first Service Worker para AHA Flota
var CACHE_PREFIX = 'aha-flota-v1';
var CACHE = CACHE_PREFIX;
var PRECACHE_URLS = [
  './', 'index.html',
  'core/env.js', 'core/db.js', 'core/crypto.js', 'core/ui.js', 'core/theme.js',
  'core/app.js', 'core/search-palette.js', 'core/file-store.js', 'core/sync.js',
  'core/license.js', 'core/network.js', 'core/main.js',
  'modules/vehiculos/module.html', 'modules/vehiculos/module.js',
  'modules/combustible/module.html', 'modules/combustible/module.js',
  'modules/mantenimiento/module.html', 'modules/mantenimiento/module.js',
  'modules/incidentes/module.html', 'modules/incidentes/module.js',
  'modules/reportes/module.html', 'modules/reportes/module.js'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(PRECACHE_URLS);
    }).then(function () {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) {
          return k !== CACHE && k.indexOf(CACHE_PREFIX) === 0;
        }).map(function (k) {
          return caches.delete(k);
        })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  var url = req.url;

  if (url.indexOf('/api/') !== -1) {
    e.respondWith(
      fetch(req).catch(function () { return caches.match(req); })
    );
    return;
  }

  e.respondWith(
    caches.match(req).then(function (cached) {
      if (cached) return cached;
      return fetch(req).then(function (response) {
        if (response && response.ok && req.method === 'GET') {
          var clone = response.clone();
          caches.open(CACHE).then(function (cache) { cache.put(req, clone); });
        }
        return response;
      });
    })
  );
});
