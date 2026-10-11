// House Call Bronze — minimal service worker.
// Network-first for page loads so visitors always see the latest site;
// falls back to the last cached copy of the page when offline.
const CACHE = `hcb-shell-v2-${self.registration.scope}`;
const HOME = self.registration.scope;

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith(`hcb-shell-`) && k.endsWith(self.registration.scope) && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || req.mode !== 'navigate') return;

  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(HOME, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(HOME).then((r) => r || Response.error()))
  );
});
