// This is handled by next-pwa and will be automatically generated during build
// This file serves as a placeholder
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Default fetch handler
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        // Return a fallback for offline experience
        return caches.match('/offline.html');
      })
  );
});
