const cacheName = "staticV5";
const dynamicName = "dynamicV1";

const trimCache = async (cacheName, maxLimit) => {
  const cacheStore = await caches.open(cacheName);
  const keys = await cacheStore.keys();
  // console.log(keys);

  if (keys.length > maxLimit) {
    const keysHalf = keys.length / 2;
    console.log(keysHalf);
    for (let i = 0; i < keysHalf; i++) {
      await cacheStore.delete(keys[i]);
    }
  }
};

oninstall = (e) => {
  console.log("[Service Worker] Installing Service Worker ...");

  e.waitUntil(
    (async () => {
      const staticStore = await caches.open(cacheName);
      console.log("[Service Worker] Precaching App Shell");
      staticStore.addAll([
        "/",
        "/offline.html",
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

// optimal caching technique
const staticArr = [
  "/",
  "/offline.html",
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
];

const staticRes = async (e) => {
  let isStatic = false;
  if (e.request.url.includes("chrome-extension")) {
    return;
  }
  if (e.request.url.endsWith(".html")) {
    isStatic = true;
  }
  if (e.request.url.endsWith(".css")) {
    isStatic = true;
  }
  if (e.request.url.endsWith(".js")) {
    isStatic = true;
  }
  if (e.request.url.endsWith("/")) {
    isStatic = true;
  }
  if (e.request.url.endsWith(".jpg")) {
    isStatic = true;
  }
  // if (e.request.url.endsWith(".png")) {
  //   isStatic = true;
  // }

  if (isStatic) {
    const cacheStore = await caches.match(e.request);
    if (cacheStore) {
      console.log(cacheStore);
      return cacheStore;
    }
  }
};
const dynamicRes = async (e) => {
  const res = await fetch(e.request);
  if (!e.request.url.includes("chrome-extension")) {
    const dynamicStore = await caches.open(dynamicName);
    dynamicStore.put(e.request.url, res.clone());
  }
  return res;
};

const offlineRes = async (e) => {
  const cacheStore = await caches.match(e.request);

  if (cacheStore) {
    return cacheStore;
  } else {
    const staticStore = await caches.open(cacheName);

    const match = await staticStore.match("/offline.html");
    if (e.request.headers.get("accept").includes("text/html")) {
      return match;
    }
  }
};
onfetch = (e) => {
  e.respondWith(
    (async () => {
      try {
        await trimCache(dynamicName, 10);

        const static = await staticRes(e);

        if (static) {
          return static;
        }

        if (!static) {
          return await dynamicRes(e);
        }
      } catch (error) {
        return await offlineRes(e);
      }
    })()
  );
};

// cache first then network fallback

// onfetch = (e) => {
//   e.respondWith(
//     (async () => {
//       try {
//         const cacheStore = await caches.match(e.request);
//         if (cacheStore) {
//           return cacheStore;
//         } else {
//           const fetchRes = await fetch(e.request);
//           if (
//             !e.request.url.includes("chrome-extension") &&
//             !e.request.url.includes("/help") &&
//             !e.request.url.includes("/feed")
//           ) {
//             const dynamicStore = await caches.open(dynamicName);
//             dynamicStore.put(e.request.url, fetchRes.clone());
//           }
//           return fetchRes;
//         }
//       } catch (error) {
//         const staticStore = await caches.open(cacheName);

//         const match = await staticStore.match("/offline.html");

//         return match;
//       }
//     })()
//   );
// };

// cache only
// onfetch = (e) => {
//   e.respondWith(
//     (async () => {
//       const cacheStore = await caches.match(e.request);
//       return cacheStore;
//     })()
//   );
// };

// network only
// onfetch = (e) => {
//   e.respondWith(
//     (async () => {
//       const res = await fetch(e.request);
//       return res;
//     })()
//   );
// };

// network first with cache fallback.
// onfetch = (e) => {
//   e.respondWith(
//     (async () => {
//       try {
//         const res = await fetch(e.request);

//         if (res) {
//           if (!e.request.url.includes("chrome-extension")) {
//             const dynamicStore = await caches.open(dynamicName);
//             dynamicStore.put(e.request.url, res.clone());
//           }
//         }

//         return res;
//       } catch (error) {
//         const cacheStore = await caches.match(e.request);
//         return cacheStore;
//       }
//     })()
//   );
// };

// // network first with cache fallback version2(better).
// onfetch = (e) => {
//   e.respondWith(
//     (async () => {
//       const res = await fetch(e.request);

//       if (res) {
//         if (!e.request.url.includes("chrome-extension")) {
//           const dynamicStore = await caches.open(dynamicName);
//           dynamicStore.put(e.request.url, res.clone());
//         }
//       }

//       return res;
//     })()
//   );
// };

// network first with cache fallback version3(hybrid).
