const CACHE_NAME = 'margdarshak-v3';
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
  
  // ONLY handle local assets to avoid CSP interference with external fetches
  if (url.origin === self.location.origin) {
    if (!url.pathname.startsWith('/api/')) {
      event.respondWith(
        caches.match(event.request).then((response) => {
          return response || fetch(event.request);
        })
      );
    }
    // API requests on same origin (Netlify functions) are handled naturally by the browser
  }
  // External requests are NOT intercepted, avoiding Service Worker CSP restrictions
});

// Original legacy logic removed due to CSP violations and stability issues
// self.options = { ... }
// importScripts('...')
