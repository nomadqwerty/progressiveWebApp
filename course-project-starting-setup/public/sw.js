oninstall = async function (e) {
  try {
    const swCache = await caches.open("static");

    swCache.addAll([
      "./",
      "./index.html",
      "./src/css/app.css",
      "./src/js/app.js",
      "./src/js/feed.js",
      "./src/js/material.min.js",
      "./src/js/fetch.js",
      "./src/js/promise.js",
    ]);
  } catch (error) {
    console.log(error.message);
  }
};
onactivate = function (e) {
  clients.claim();
};
// onfetch = async function (e) {
//   e.respondWith(
//     caches
//       .match(e.request)
//       .then((res) => {
//         if (res) {
//           return res;
//         } else {
//           return fetch(e.request);
//         }
//       })
//       .catch((err) => console.log(err.message))
//   );
// };
onfetch = function (e) {
  e.respondWith(
    (async () => {
      const cacheStore = await caches.match(e.request);
      if (cacheStore) {
        console.log("offline ");
        return cacheStore;
      } else if (!cacheStore) {
        console.log("not yet cached");
        if (!e.request.url.includes("chrome-extension")) {
          const newCacheStore = await caches.open("dynamic");
          newCacheStore.add(e.request.url);
          const newCacheData = await newCacheStore.match(e.request);
          if (newCacheData) {
            console.log("cached and returned");
            return newCacheData;
          }
        } else {
          console.log("extension");
          const res = await fetch(e.request);
          return res;
        }
      }
    })()
  );
};
