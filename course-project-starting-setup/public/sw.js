const cacheName = "staticV1";
const dynamicName = "dynamicV1";

oninstall = (e) => {
  console.log("[Service Worker] Installing Service Worker ...");

  e.waitUntil(
    (async () => {
      const staticStore = await caches.open(cacheName);
      console.log("[Service Worker] Precaching App Shell");
      staticStore.addAll([
        "/",
        "/index.html",
        "/src/js/app.js",
        "/src/js/feed.js",
        "/src/js/promise.js",
        "/src/js/fetch.js",
        "/src/js/material.min.js",
        "/src/css/app.css",
        "/src/css/feed.css",
        "/src/images/main-image.jpg",
        "https://fonts.googleapis.com/css?family=Roboto:400,700",
        "https://fonts.googleapis.com/icon?family=Material+Icons",
        "https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css",
      ]);
    })()
  );
};
onactivate = (e) => {
  console.log("[Service Worker] Activating Service Worker ....");
  e.waitUntil(
    (async () => {
      const cacheArray = await caches.keys();
      cacheArray.forEach((key, i) => {
        if (key !== cacheName && key !== dynamicName) {
          console.log(key);
          caches.delete(key);
        }
      });
    })()
  );
  return self.clients.claim();
};

onfetch = (e) => {
  e.respondWith(
    (async () => {
      const cacheStore = await caches.match(e.request);
      if (cacheStore) {
        return cacheStore;
      } else {
        const fetchRes = await fetch(e.request);
        const dynamicStore = await caches.open(dynamicName);
        dynamicStore.put(e.request.url, fetchRes.clone());
        return fetchRes;
      }
    })()
  );
};
