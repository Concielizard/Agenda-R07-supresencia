// Agenda Devocional R07 «Pasa tiempo Conmigo»
// Service Worker v3 - 100% Offline-First Architecture

const CACHE_NAME = 'r07-agenda-v3';

// 1. Static shell assets
const STATIC_PRECACHE = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.ico',
  '/fonts/material-icons.ttf',
  '/icons/apple-touch-icon.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/favicon.png'
];

// 2. All 66 Books of Reina Valera 1960 & 66 Books of Nueva Traducción Viviente (132 files)
const BIBLE_PRECACHE = [];
for (let i = 1; i <= 66; i++) {
  BIBLE_PRECACHE.push(`/bible/rvr1960/${i}.json`);
  BIBLE_PRECACHE.push(`/bible/ntv/${i}.json`);
}

// Install: Cache all critical shell assets, all 132 Bible files, and discover Angular JS/CSS bundles
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Step A: Fetch index.html to discover hashed script and link bundles (main-*.js, styles-*.css, chunk-*.js)
      try {
        const indexRes = await fetch('/index.html');
        if (indexRes.ok) {
          const html = await indexRes.text();
          await cache.put('/index.html', new Response(html, { headers: indexRes.headers }));
          await cache.put('/', new Response(html, { headers: indexRes.headers }));

          // Find all scripts and stylesheets referenced in index.html
          const scriptMatches = Array.from(html.matchAll(/src=["']([^"']+\.js)["']/g), m => m[1]);
          const linkMatches = Array.from(html.matchAll(/href=["']([^"']+\.(?:css|js))["']/g), m => m[1]);
          const dynamicBundles = Array.from(new Set([...scriptMatches, ...linkMatches]));

          for (const bundle of dynamicBundles) {
            try {
              const bRes = await fetch(bundle);
              if (bRes && bRes.status === 200) {
                await cache.put(bundle, bRes);
              }
            } catch (err) {
              console.warn('[SW] Bundle precache error:', bundle, err);
            }
          }
        }
      } catch (err) {
        console.warn('[SW] index.html bundle discovery failed:', err);
      }

      // Step B: Cache static assets and all Bible files in parallel batches
      const allUrls = [...STATIC_PRECACHE, ...BIBLE_PRECACHE];
      const batchSize = 15;
      for (let i = 0; i < allUrls.length; i += batchSize) {
        const batch = allUrls.slice(i, i + batchSize);
        await Promise.allSettled(
          batch.map(async (url) => {
            try {
              const res = await fetch(url);
              if (res && res.status === 200) {
                await cache.put(url, res);
              }
            } catch (e) {
              // Ignore single file fetch error during install
            }
          })
        );
      }
    }).then(() => self.skipWaiting())
  );
});

// Activate: Purge old cache versions and claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Offline-First Smart Cache Strategy
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle GET requests
  if (req.method !== 'GET') return;

  // 1. Navigation requests (HTML) -> Network first, fallback to cached index.html
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const copy = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return networkRes;
        })
        .catch(() => {
          return caches.match('/index.html') || caches.match('/');
        })
    );
    return;
  }

  // 2. Bible books, Fonts, Icons, JS bundles, CSS styles -> Cache first, fallback to network
  if (
    url.pathname.startsWith('/bible/') ||
    url.pathname.startsWith('/fonts/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.woff2') ||
    url.pathname.endsWith('.ttf') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.webmanifest') ||
    url.hostname.includes('fonts.gstatic.com') ||
    url.hostname.includes('fonts.googleapis.com')
  ) {
    event.respondWith(
      caches.match(req).then((cachedRes) => {
        if (cachedRes) {
          return cachedRes;
        }
        return fetch(req).then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const copy = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return networkRes;
        });
      }).catch(() => {
        return caches.match(req);
      })
    );
    return;
  }

  // 3. All other requests: Network first with cache fallback & caching successful responses
  event.respondWith(
    fetch(req)
      .then((networkRes) => {
        if (networkRes && networkRes.status === 200) {
          const copy = networkRes.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        }
        return networkRes;
      })
      .catch(() => caches.match(req))
  );
});
