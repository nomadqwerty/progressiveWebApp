(async () => {
  if (navigator.serviceWorker) {
    const swReg = await navigator.serviceWorker.register("../../sw.js");

    if (swReg.active) {
      console.log("registered service worker");
    }
  }
})();
