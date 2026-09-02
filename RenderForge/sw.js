const RF_CACHE = "renderforge-pwa-v1";
const RF_SHELL = [
  "./RenderForge_index.html",
  "./character-save.js",
  "./renderforge-archive.js",
  "./renderforge-connector.js",
  "./renderforge-image.js",
  "./renderforge-phase1.js",
  "./renderforge-phase2.js",
  "./renderforge-ui.js",
  "./manifest.webmanifest",
  "./icons/renderforge-192.png",
  "./icons/renderforge-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(RF_CACHE).then(cache => cache.addAll(RF_SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith("renderforge-pwa-") && k !== RF_CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Keep app code fresh online, but retain an offline fallback.
  if (req.mode === "navigate" || /\.(?:html|js|webmanifest)$/.test(url.pathname)) {
    event.respondWith(
      fetch(req, {cache:"no-store"}).then(res => {
        const copy = res.clone();
        caches.open(RF_CACHE).then(cache => cache.put(req, copy));
        return res;
      }).catch(async () => {
        const hit = await caches.match(req);
        return hit || caches.match("./RenderForge_index.html");
      })
    );
    return;
  }

  event.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
    const copy = res.clone();
    caches.open(RF_CACHE).then(cache => cache.put(req, copy));
    return res;
  })));
});
