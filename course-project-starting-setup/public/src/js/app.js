window.promptEvent = null;
const enableNotification = document.querySelectorAll(".enable-notifications");

const url64To8bitArr = (url64) => {
  let padding = "=".repeat((4 - (url64.length % 4)) % 4);
  let base64 = (url64 + padding).replace(/\-/g, "+").replace(/_/g, "/");

  let rawData = window.atob(base64);
  let outPutArr = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i++) {
    outPutArr[i] = rawData.charCodeAt(i);
  }
  console.log(outPutArr);
  return outPutArr;
};

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

const showNotification = async () => {
  if (navigator.serviceWorker) {
    const swreg = await navigator.serviceWorker.ready;
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
    swreg.showNotification(
      "notification permission granted from service worker",
      notificationObject
    );
  }
};

const pushSubscription = async () => {
  if (navigator.serviceWorker) {
    if (window.Notification) {
      const swReg = await navigator.serviceWorker.ready;
      const subs = await swReg.pushManager.getSubscription();

      console.log(subs);
      if (!subs) {
        try {
          // create a new subscription.
          const pubKey =
            "BJTnb4WHULLLnmRmPOhqrf6rQGJ7KYmcQ3XNzieAvFqtomw47Je3uFJnLtI1UIzekfLRjm3stdOejndX81vKUqs";

          let pubKeyConvert = url64To8bitArr(pubKey);

          const subscription = await swReg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: pubKeyConvert,
          });

          const res = await fetch("http://192.168.8.148:3000/subs", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
              "Access-Control-Allow-Headers": "*",
            },
            body: JSON.stringify(subscription),
          });

          console.log(res);
          await showNotification();
        } catch (error) {
          console.log(error);
        }
      } else {
        // use the existing subscription.
      }
    }
  }
};
console.log("change");
const getNotificationPermission = async (e) => {
  console.log("here");
  const isGranted = await window.Notification.requestPermission();
  if (isGranted === "granted") {
    console.log("permision granted");
    e.target.style.display = "none";
    await pushSubscription();
  }
};

console.log(enableNotification);
if (window.Notification) {
  for (let i = 0; i < enableNotification.length; i++) {
    enableNotification[i].addEventListener("click", getNotificationPermission);
  }
} else {
  enableNotification.style.display = "none";
}
