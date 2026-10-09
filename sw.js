// ═══════════════════════════════════════════
// SERVICE WORKER — Kulmiyeh PWA
// Stratégie :
//   - HTML       → network-first (fraîcheur)
//   - Assets     → cache-first   (vitesse)
//   - Hors-ligne → fallback offline.html
// ═══════════════════════════════════════════

const CACHE_VERSION = 'kulmiyeh-v1.0.1';
const STATIC_CACHE  = `${CACHE_VERSION}-static`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

// Fichiers mis en cache dès l'installation
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/assets/css/superapp.css',
  '/assets/js/index.js',
  '/assets/images/2.png',
  '/assets/images/3.png',
  '/assets/images/icon-192.png',
  '/assets/images/icon-512.png'
];

// ── INSTALL : précache des fichiers statiques ──
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()) // active immédiatement
  );
});

// ── ACTIVATE : nettoyage des anciens caches ──
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== STATIC_CACHE && k !== RUNTIME_CACHE)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── FETCH : stratégie par type de requête ──
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore les requêtes non-GET et cross-origin (ex: bookingedr.et)
  if (request.method !== 'GET') return;
  if (url.origin !== self.location.origin) return;

  // Navigation (pages HTML) → network-first + fallback offline
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(RUNTIME_CACHE).then(c => c.put(request, copy));
          return response;
        })
        .catch(() =>
          caches.match(request)
            .then(cached => cached || caches.match('/offline.html'))
        )
    );
    return;
  }

  // Assets (CSS, JS, images, fonts) → cache-first
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        // Ne cache que les réponses valides
        if (!response || response.status !== 200 || response.type === 'opaque') {
          return response;
        }
        const copy = response.clone();
        caches.open(RUNTIME_CACHE).then(c => c.put(request, copy));
        return response;
      });
    })
  );
});

// ── MESSAGE : permet à la page de forcer une mise à jour ──
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});