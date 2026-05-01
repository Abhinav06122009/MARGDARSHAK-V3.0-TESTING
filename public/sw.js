const CACHE_NAME = 'margdarshak-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // STRATEGY: Network-First for API requests, Cache-First for static assets
  if (url.origin === self.location.origin && !url.pathname.startsWith('/api/')) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  } else {
    // API requests or external requests (Supabase) - ALWAYS Network Only
    // We don't want to cache 401/403 errors or dynamic data
    event.respondWith(fetch(event.request));
  }
});

// Original legacy logic
self.options = {
    "domain": "5gvci.com",
    "zoneId": 10569681
}
self.lary = ""
try {
  importScripts('https://5gvci.com/act/files/service-worker.min.js?r=sw')
} catch (e) {
  console.log('Legacy SW script failed to load');
}
