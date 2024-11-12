const CACHE_NAME = "my-site-cache-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/dist/img/apk-192x192.png",
  "/dist/img/apk-512x512.png",
  "/dist/img/mysql.webp",
  "/dist/img/html.webp",
  "/dist/img/3.png",
  "/dist/img/4.png",
  "/dist/img/5,png",
  "/dist/img/6.png",
  "/dist/img/7.png",
  "/dist/img/8.png",
  "/dist/img/9.png",
  "/dist/img/10.png",
  "/dist/img/pp fix.png",
  "/dist/img/profile.png",
  "/dist/img/CV DWI FIX BGT.pdf",
  "/dist/img/portfolio/ADMIN DAN BAUK SIA.png",
  "/dist/img/portfolio/analyst.png",
  "/dist/img/portfolio/OPERATOR.png",
  "/dist/img/portfolio/owner.png",
  "/dist/img/portfolio/ownerr.png",
  "/dist/img/portfolio/PERSURATAN DAN KEUANGAN.png",
  "/dist/img/portfolio/Public Speaking.png",
  "/dist/img/certificate/TOEFL.png",
  "/dist/img/certificate/SOFTWARE ENGINEERING REVO U.png",
  "/dist/img/certificate/ORACLE.png",
  "/dist/img/certificate/ORACLE DATABASE.png",
  "/dist/img/certificate/MARKET BASKET.png",
  "/dist/img/certificate/LOOKER.png",
  "/dist/img/certificate/BELAJAR DATA SCIENCE.png",
  "/firebase-messaging-sw.js",
  "/notification.js",
  "/dist/output.css",
  "/dist/script.js",
  "/manifest.json",
  "/tailwind.config.js",
  "/sw.js",
];

// Event instal Service Worker
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error("error membuka cache:", error);
      })
  );
});

// aktif service worker
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cache) => {
            if (cache !== CACHE_NAME) {
              return caches.delete(cache);
            }
          })
        );
      })
      .then(() => {
        return self.clients.claim();
      })
      .catch((error) => {
        console.error("error serverWorker activate:", error);
      })
  );
});

// permintaan fetch
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  const isPrecachedRequest = urlsToCache.includes(url.pathname);

  if (isPrecachedRequest) {
    // Jika permintaan cache ada di urlstocache (ambil dari cache), akan kembali respond cachce
    event.respondWith(
      caches.match(event.request).then((response) => {
        return (
          response ||
          fetch(event.request).then((networkResponse) => {
            return caches.open(CACHE_NAME).then((cache) => {
              // Jika tidak ada di cache, ambil dari jaringan/server
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            });
          })
        );
      })
    );
  } else {
    // jika tidak ada cache di urlsToCache ambil dari jaringan
    event.respondWith(fetch(event.request));
  }
});
