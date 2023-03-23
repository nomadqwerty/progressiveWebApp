oninstall = async function (e) {
  try {
    const swCache = await caches.open("static");
    console.log(swCache);
    swCache.add("./src/js/app.js");
  } catch (error) {
    console.log(error.message);
  }
};
onactivate = function (e) {
  clients.claim();
};
onfetch = function (e) {
  e.respondWith(fetch(e.request));
};
