window.promptEvent = null;
const enableNotification = document.querySelectorAll(".enable-notifications");

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

const getNotificationPermission = async (e) => {
  console.log("here");
  const isGranted = await window.Notification.requestPermission();
  if (isGranted === "granted") {
    console.log("permision granted");
    e.target.style.display = "none";
    showNotification();
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
