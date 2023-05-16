importScripts("/src/js/idb.js");

const cacheName = "staticV2";
const dynamicName = "dynamicV1";

const trimCache = async (cacheName, maxLimit) => {
  const cacheStore = await caches.open(cacheName);
  const keys = await cacheStore.keys();

  if (keys.length > maxLimit) {
    const keysHalf = keys.length / 2;
    for (let i = 0; i < keysHalf; i++) {
      await cacheStore.delete(keys[i]);
    }
  }
};

const staticFilesArray = [
  "/",
  "/offline.html",
  "/index.html",
  "/src/js/idb.js",
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

let dbPromise = idb.open("posts-store", 1, (db) => {
  if (!db.objectStoreNames.contains("post")) {
    db.createObjectStore("posts", { KeyPath: "id" });
  }
  if (!db.objectStoreNames.contains("sync-post")) {
    db.createObjectStore("sync-post", { KeyPath: "id" });
  }
});
console.log(self);
oninstall = (e) => {
  console.log("[Service Worker] Installing Service Worker ...");

  e.waitUntil(
    (async () => {
      const staticStore = await caches.open(cacheName);
      console.log("[Service Worker] Precaching App Shell");
      staticStore.addAll(staticFilesArray);
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
      return cacheStore;
    }
  }
};
const dynamicRes = async (e) => {
  const res = await fetch(e.request);
  if (!e.request.url.includes("chrome-extension")) {
    if (
      e.request.url.indexOf(
        "https://impactapi-default-rtdb.firebaseio.com/posts.json"
      ) > -1
    ) {
      const cloneRes = res.clone();
      const data = await cloneRes.json();

      const db = await dbPromise;
      const txDelete = db.transaction("posts", "readwrite");
      const storeToClear = txDelete.objectStore("posts");
      await storeToClear.clear();
      txDelete.complete;
      for (let key in data) {
        try {
          // TODO: turn to function.
          const tx = db.transaction("posts", "readwrite");
          const store = tx.objectStore("posts");
          store.put(data[key], key);
          await tx.complete;
          console.log("done");
        } catch (error) {
          console.log(error);
        }
      }
    } else {
      const dynamicStore = await caches.open(dynamicName);
      dynamicStore.put(e.request.url, res.clone());
    }
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

onsync = (e) => {
  console.log("backgroud synching");

  e.waitUntil(
    (async () => {
      if (e.tag === "sync-task-postreq") {
        console.log(e.tag);
        // read req obj stored in idb.
        const db = await dbPromise;
        const tx = db.transaction("sync-post", "readwrite");

        const store = tx.objectStore("sync-post");

        const data = await store.getAll();
        tx.complete;

        const cloneData = [...data];
        console.log(cloneData);

        // // send post request.

        let urlLink =
          "https://impactapi-default-rtdb.firebaseio.com/posts.json";
        const res = await fetch(urlLink, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(cloneData[cloneData.length - 1]),
        });
        console.log(res);
        if (res.ok) {
          console.log("res was 200");
          const db = await dbPromise;
          const tx = db.transaction("sync-post", "readwrite");

          const storeClear = tx.objectStore("sync-post");
          await storeClear.clear();
          tx.complete;
        }
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
