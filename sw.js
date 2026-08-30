const CACHE = 'race-generator-r4-2-5000-auto-library-v1';
const OFFLINE_HTML='./index.html';
const CORE=[
  './manifest.webmanifest',
  './races.js',
  './Icons/icon-192.png',
  './Icons/icon-512.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)));
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const isNavigation = request.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('/index.html');

  if (isNavigation) {
    event.respondWith((async () => {
      try {
        // Fetch the canonical index URL, not the query-string navigation URL.
        // This prevents ?stepX cache-busters from creating separate stale HTML entries.
        const canonical = new Request(new URL('./index.html', self.registration.scope).href, {
          method: 'GET',
          headers: { 'Cache-Control': 'no-cache' },
          cache: 'reload',
          credentials: 'same-origin',
          redirect: 'follow'
        });
        const response = await fetch(canonical);
        if (!response || !response.ok) throw new Error('Network HTML unavailable');
        const cache = await caches.open(CACHE);
        await cache.put(OFFLINE_HTML, response.clone());
        return response;
      } catch (err) {
        const cached = await caches.match(OFFLINE_HTML);
        if (cached) return cached;
        throw err;
      }
    })());
    return;
  }

  // Manifest, worker, and race data should prefer the network so updates are visible.
  if (url.pathname.endsWith('/manifest.webmanifest') || url.pathname.endsWith('/sw.js') || url.pathname.endsWith('/races.js')) {
    event.respondWith((async () => {
      try {
        const response = await fetch(request, { cache: 'no-store' });
        if (response && response.ok && url.pathname.endsWith('/races.js')) {
          const cache = await caches.open(CACHE);
          await cache.put(request, response.clone());
        }
        return response;
      } catch (err) {
        const cached = await caches.match(request);
        if (cached) return cached;
        throw err;
      }
    })());
    return;
  }

  // Static assets remain cache-first for offline use.
  event.respondWith(caches.match(request).then(cached => cached || fetch(request).then(response => {
    if (response && response.ok && response.type === 'basic') {
      const copy = response.clone();
      caches.open(CACHE).then(cache => cache.put(request, copy));
    }
    return response;
  })));
});
