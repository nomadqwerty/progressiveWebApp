window.promptEvent = null;
// add polyfills ffrom app.js
if (!window.Promise) {
  window.Promise = Promise;
}

(async () => {
  try {
    if (navigator.serviceWorker) {
      const swReg = await navigator.serviceWorker.register("../../sw.js");

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

const prom = new Promise((res, rej) => {
  let a = false;
  if (!a) {
    res("resolved promise");
  }

  rej(new Error("error"));
});

Promise.resolve(prom).then((res) => {
  console.log(res);
});

Promise.reject(prom)
  .then((res) => {
    console.log(res);
  })
  .catch((err) => {
    console.log(err);
  });
