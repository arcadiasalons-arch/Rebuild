// House Call Bronze — minimal service worker.
// Network-first for page loads so visitors always see the latest site;
// falls back to the last cached copy of the page when offline.
const SHELL_CACHE = `hcb-shell-v3-${self.registration.scope}`;
const ASSET_CACHE = `hcb-assets-v3-${self.registration.scope}`;
const HOME = self.registration.scope;

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => (k.startsWith(`hcb-shell-`) || k.startsWith(`hcb-assets-`)) && k.endsWith(self.registration.scope) && k !== SHELL_CACHE && k !== ASSET_CACHE)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(SHELL_CACHE).then((c) => c.put(HOME, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => caches.match(HOME).then((r) => r || Response.error()))
    );
    return;
  }

  event.respondWith(
    caches.open(ASSET_CACHE).then(async (cache) => {
      const cached = await cache.match(req);
      const sameOrigin = new URL(req.url).origin === self.location.origin;
      const cacheable = sameOrigin && req.destination !== 'document';
      if (cached) {
        if (cacheable) {
          fetch(req)
            .then((res) => res.ok && cache.put(req, res.clone()))
            .catch(() => {});
        }
        return cached;
      }
      if (!cacheable) return fetch(req);
      try {
        const res = await fetch(req);
        if (res.ok) cache.put(req, res.clone()).catch(() => {});
        return res;
      } catch {
        return Response.error();
      }
    })
  );
});
