/**
 * Grind service worker — makes the app installable (add to home screen / Play
 * Store criteria) and keeps the shell usable offline.
 *
 * Strategy:
 *  - Navigations (SPA routes): network-first, fall back to cached '/' shell.
 *  - Static assets (/assets/…): cache-first.
 *  - API calls: network-only, never cached.
 */
const VERSION = 'grind-v4';
const STATIC_CACHE = `${VERSION}-static`;
const SHELL_CACHE = `${VERSION}-shell`;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.add('/'))
      .then(() => self.skipWaiting())
      .catch(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k.startsWith('grind-') && k !== STATIC_CACHE && k !== SHELL_CACHE)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Never cache API traffic
  if (url.pathname.startsWith('/api')) return;

  // SPA navigations: network first, shell fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(SHELL_CACHE).then((cache) => cache.put('/', copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => caches.match('/').then((hit) => hit || Response.error())),
    );
    return;
  }

  // Static assets: cache-first
  if (url.pathname.startsWith('/assets/') || url.pathname.endsWith('.png') || url.pathname.endsWith('.svg') || url.pathname.endsWith('.ico')) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((res) => {
            if (res && res.ok) {
              const copy = res.clone();
              caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
            }
            return res;
          }),
      ),
    );
  }
});
