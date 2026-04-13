/// <reference lib="WebWorker" />

const sw = self as unknown as ServiceWorkerGlobalScope;

const CACHE_NAME = 'todo-pwa-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.webmanifest'
];

sw.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => sw.skipWaiting())
  );
});

sw.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      ))
      .then(() => sw.clients.claim())
  );
});

sw.addEventListener('fetch', (event: FetchEvent) => {
  // Обрабатываем только GET запросы
  if (event.request.method !== 'GET') return;

  event.respondWith(
    
    caches.match(event.request)
    
    .then((cachedResponse) => {
      // Если есть в кэше, возвращаем из кэша и одновременно обновляем кэш в фоне
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Кэшируем только успешные ответы
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      
    .catch((error) => {
        console.error('Fetch failed:', error);
        // Если сеть недоступна и нет кэша, возвращаем оффлайн страницу
        if (!cachedResponse) {
          return new Response('Вы оффлайн. Пожалуйста, проверьте подключение к интернету.', { 
            status: 404,
            headers: { 'Content-Type': 'text/plain' }
          });
        }
        throw error;
      });

      // Возвращаем кэшированный ответ или результат fetch
      return cachedResponse || fetchPromise;
    })
  );
});