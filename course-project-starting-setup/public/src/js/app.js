window.promptEvent = null;
// add polyfills ffrom app.js
if (!window.Promise) {
  window.Promise = Promise;
}

(async () => {
  try {
    if (navigator.serviceWorker) {
      const swReg = await navigator.serviceWorker.register("../../sw.js", {
        scope: "/",
      });

      if (swReg.active) {
        console.log("registered service worker");
      }
    }
  } catch (error) {
    console.log(error);
  }
})();
onbeforeinstallprompt = (e) => {
  console.log("before install prompt triggered");
  e.preventDefault();
  window.promptEvent = e;
};
console.log(window.promptEvent);
