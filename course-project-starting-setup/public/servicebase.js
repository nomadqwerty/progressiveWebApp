importScripts("workbox-sw.prod.v2.1.3.js");

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

workboxSW.precache([]);
