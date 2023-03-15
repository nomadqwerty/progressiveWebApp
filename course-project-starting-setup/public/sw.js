oninstall = function (e) {
  console.log("service worker installing....", e);
};
onactivate = function (e) {
  console.log("service worker activating....", e);
  clients.claim();
};
onfetch = function (e) {
  console.log("service worker fetching....", e);
  e.respondWith(fetch(e.request));
};
