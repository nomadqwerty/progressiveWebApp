importScripts("workbox-sw.prod.v2.1.3.js");
importScripts("/src/js/idb.js");

let dbPromise = idb.open("posts-store", 1, (db) => {
  if (!db.objectStoreNames.contains("post")) {
    db.createObjectStore("posts", { KeyPath: "id" });
  }
  if (!db.objectStoreNames.contains("sync-post")) {
    db.createObjectStore("sync-post", { KeyPath: "id" });
  }
});

let routeMatch = /.*(?:googleapis|gstatic)\.com.*$/;
let fireBaseRouteMatch = /.*(?:firebasestorage\.googleapis)\.com.*$/;

const workboxSW = new self.WorkboxSW();

workboxSW.router.registerRoute(
  routeMatch,
  workboxSW.strategies.staleWhileRevalidate({
    cacheName: "cdnFonts",
    cacheExpiration: {
      maxEntries: 10,
      maxAgeSeconds: 60 * 60 * 24 * 30,
    },
  })
);
workboxSW.router.registerRoute(
  fireBaseRouteMatch,
  workboxSW.strategies.staleWhileRevalidate({
    cacheName: "firebaseImages",
  })
);
workboxSW.router.registerRoute(
  "https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css",
  workboxSW.strategies.staleWhileRevalidate({
    cacheName: "cdnCss",
  })
);

workboxSW.router.registerRoute(
  "https://impactapi-default-rtdb.firebaseio.com/posts.json",
  async (args) => {
    // args is an object passed into the function when executed. like event objects
    console.log(args);
    const res = await fetch(args.event.request);
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
        // console.log("done");
      } catch (error) {
        console.log(error);
      }
    }

    return res;
  }
);

workboxSW.router.registerRoute(
  function (routeData) {
    // function is called with a route data object.
    const match = routeData.event.request.headers
      .get("accept")
      .includes("text/html");

    return match;
  },
  async (args) => {
    try {
      const res = await fetch(args.event.request);

      return res;
    } catch {
      const cacheStore = await caches.match(args.event.request);

      if (cacheStore) {
        return cacheStore;
      } else {
        const staticStore = await caches.open(
          "workbox-precaching-revisioned-v1-http://127.0.0.1:8080/"
        );

        const match = await staticStore.match("/offline.html");
        return match;
      }
    }
  }
);

workboxSW.precache([]);

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

onnotificationclick = (e) => {
  console.log("notification click");
  const { notification, isTrusted, action } = e;
  console.log(notification, action, isTrusted);

  if (e.action === "confirm") {
    e.waitUntil(
      (async () => {
        const clientPages = await clients.matchAll();
        console.log(clientPages);
        const clientPage = clientPages.find((c) => {
          return c.visibilityState === "visible";
        });
        console.log(clientPage);
        if (clientPage) {
          clientPage.navigate("http://localhost:8080");
          clientPage.focus();
        } else {
          clients.openWindow("http://localhost:8080");
        }
      })()
    );
  }
  notification.close();
};

onnotificationclose = (e) => {
  console.log("notification closed");
  const { notification, isTrusted, action } = e;
  console.log(notification, action, isTrusted);
  notification.close();
};

onpush = (e) => {
  console.log("push notification received", e);
  const data = e.data;
  const notificationObject = {
    body: "you have subcribed to get notification from this app",
    icon: "../images/icons/app-icon-384x384.png",
    image: "../images/main-image-lg.jpg",
    dir: "ltr",
    lang: "eng-US",
    vibrate: [100, 50, 100],
    badge: "../images/icons/app-icon-96x96.png",
    tag: "subcriptionTag",
    renotify: false,
    actions: [
      { action: "confirm", title: "confirm" },
      { action: "cancel", title: "cancel" },
    ],
  };
  e.waitUntil(
    (() => {
      if (data.title && data.content) {
        notificationObject.body = data.content;
        self.registration.showNotification(data.title, notificationObject);
      } else {
        console.log("no data");
        self.registration.showNotification("something new", notificationObject);
      }
    })()
  );
};
