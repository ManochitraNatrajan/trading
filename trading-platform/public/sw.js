self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (e) => {
  // Pass-through fetch to fulfill strict PWA installability requirements
  e.respondWith(fetch(e.request).catch(() => new Response('Offline')));
});
