importScripts("workbox-sw.prod.v2.1.3.js");

const workboxSW = new self.WorkboxSW();
workboxSW.precache([
  {
    "url": "dbUtils.js",
    "revision": "eb465d2d6614f0514f24c4b70bb80940"
  },
  {
    "url": "favicon.ico",
    "revision": "2cab47d9e04d664d93c8d91aec59e812"
  },
  {
    "url": "index.html",
    "revision": "dcdb38d559204791192b062819eaab75"
  },
  {
    "url": "manifest.json",
    "revision": "53ba241d6eca3efbb807b4b4f390538b"
  },
  {
    "url": "offline.html",
    "revision": "070fa9b17534ff6b4dec8006619cd892"
  },
  {
    "url": "servicebase.js",
    "revision": "a7aae57e688e3c3efb7c8cd7c64fe4f3"
  },
  {
    "url": "src/css/app.css",
    "revision": "1449397ee1bd9487a4f9469470d8d9ec"
  },
  {
    "url": "src/css/feed.css",
    "revision": "2079c5fdf053a3ea25e94d20738db08c"
  },
  {
    "url": "src/css/help.css",
    "revision": "1c6d81b27c9d423bece9869b07a7bd73"
  },
  {
    "url": "src/js/app.js",
    "revision": "7ca810b46eb9e0944988c076487fc87f"
  },
  {
    "url": "src/js/feed.js",
    "revision": "50c548608c5836e20a75752d003048dc"
  },
  {
    "url": "src/js/fetch.js",
    "revision": "6b82fbb55ae19be4935964ae8c338e92"
  },
  {
    "url": "src/js/idb.js",
    "revision": "017ced36d82bea1e08b08393361e354d"
  },
  {
    "url": "src/js/material.min.js",
    "revision": "713af0c6ce93dbbce2f00bf0a98d0541"
  },
  {
    "url": "src/js/promise.js",
    "revision": "4338cc2ce1f34ad2f4ba918ca762e001"
  },
  {
    "url": "sw.js",
    "revision": "c4fd7aa63feee204b5835baf06575645"
  },
  {
    "url": "workbox-sw.prod.v2.1.3.js",
    "revision": "a9890beda9e5f17e4c68f42324217941"
  },
  {
    "url": "src/images/main-image-lg.jpg",
    "revision": "31b19bffae4ea13ca0f2178ddb639403"
  },
  {
    "url": "src/images/main-image-sm.jpg",
    "revision": "c6bb733c2f39c60e3c139f814d2d14bb"
  },
  {
    "url": "src/images/main-image.jpg",
    "revision": "5c66d091b0dc200e8e89e56c589821fb"
  }
]);
