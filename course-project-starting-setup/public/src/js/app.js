window.promptEvent = null;
// add polyfills ffrom app.js
if (!window.Promise) {
  window.Promise = Promise;
}

(async () => {
  try {
    if (navigator.serviceWorker) {
      const regArray = await navigator.serviceWorker.getRegistrations();
      let unregistered;
      if (regArray.length > 0) {
        for (let i = 0; i < regArray.length; i++) {
          const didUnregister = await regArray[i].unregister();
          unregistered = didUnregister;
          if (!didUnregister) {
            console.log("failed to unregister old service worker!!!");
            return;
          }
          console.log("unregistering old service worker...");
        }
      }

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
