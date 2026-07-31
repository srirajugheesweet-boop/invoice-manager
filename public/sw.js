// InvoiceNext PWA Service Worker with Automatic Deployment Updates
const CACHE_NAME = "invoicenext-cache-v1";

// Install Event - Immediately activate new service worker when deployed
self.addEventListener("install", (event) => {
  self.skipWaiting();
});

// Activate Event - Take control of all open pages immediately
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Network first strategy for immediate deployment updates
self.addEventListener("fetch", (event) => {
  // Skip non-GET or chrome-extension requests
  if (event.request.method !== "GET" || !event.request.url.startsWith("http")) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Cache fresh response if valid
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === "basic") {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Fallback to cache if offline
        return caches.match(event.request);
      })
  );
});
