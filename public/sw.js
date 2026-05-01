const CACHE_NAME = 'margdarshak-v3-clear-v2';

// IMMEDIATE KILL-SWITCH: Clear all caches and deactivate
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// REMOVED fetch handler to eliminate 'no-op fetch handler' browser warning.
// Navigation will now proceed naturally without Service Worker overhead.
