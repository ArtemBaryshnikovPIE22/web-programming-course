"use strict";
(() => {
  // src/sw.ts
  var sw = self;
  var CACHE_NAME = "todo-pwa-v1";
  var urlsToCache = [
    "/",
    "/index.html",
    "/manifest.webmanifest"
  ];
  sw.addEventListener("install", (event) => {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)).then(() => sw.skipWaiting())
    );
  });
  sw.addEventListener("activate", (event) => {
    event.waitUntil(
      caches.keys().then((keys) => Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )).then(() => sw.clients.claim())
    );
  });
  sw.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") return;
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        }).catch((error) => {
          console.error("Fetch failed:", error);
          if (!cachedResponse) {
            return new Response("\u0412\u044B \u043E\u0444\u0444\u043B\u0430\u0439\u043D. \u041F\u043E\u0436\u0430\u043B\u0443\u0439\u0441\u0442\u0430, \u043F\u0440\u043E\u0432\u0435\u0440\u044C\u0442\u0435 \u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u0435 \u043A \u0438\u043D\u0442\u0435\u0440\u043D\u0435\u0442\u0443.", {
              status: 404,
              headers: { "Content-Type": "text/plain" }
            });
          }
          throw error;
        });
        return cachedResponse || fetchPromise;
      })
    );
  });
})();
