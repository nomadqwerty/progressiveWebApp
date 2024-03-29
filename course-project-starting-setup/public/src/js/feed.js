// console.log(window.idb);

let idb = window.idb;
// console.log(idb);

var shareImageButton = document.querySelector("#share-image-button");
var createPostArea = document.querySelector("#create-post");
var closeCreatePostModalButton = document.querySelector(
  "#close-create-post-modal-btn"
);
var sharedMomentsArea = document.querySelector("#shared-moments");
let form = document.querySelector("form");
let titleInput = document.querySelector("#title");
let locationInput = document.querySelector("#location");
let videoPlayer = document.querySelector("#player");
let canvasEl = document.querySelector("#canvas");
let captureBtn = document.querySelector("#capture-btn");
let imagePicker = document.querySelector("#image-picker");
let imagePickerArea = document.querySelector("#pick-image");

// creating a polyfill.
// this is a polyfill that will create suport for the media devices feature on older browsers.

const initMedia = async () => {
  try {
    if (!navigator.mediaDevices) {
      navigator.mediaDevices = {};
    }
    if (!navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia = (constriants) => {
        let getUserMedia =
          navigator.webKitGetUserMedia || navigator.mozGetUserMedia;

        if (!getUserMedia) {
          return Promise.reject(new Error("failed to get user media"));
        }
        return new Promise((resolve, reject) => {
          getUserMedia.call(navigator, constriants, resolve, reject);
        });
      };
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    videoPlayer.srcObject = stream;
    videoPlayer.style.display = "block";
  } catch (error) {
    imagePickerArea.style.display = "block";
  }
};

let dataBase;
if (idb) {
  let dbPromise = idb.open("posts-store", 1, (db) => {
    if (!db.objectStoreNames.contains("posts")) {
      db.createObjectStore("posts", { KeyPath: "id" });
    }
    if (!db.objectStoreNames.contains("sync-post")) {
      db.createObjectStore("sync-post", { KeyPath: "id" });
    }
  });
  dataBase = dbPromise;
}

console.log(window.promptEvent);
async function openCreatePostModal() {
  createPostArea.style.display = "block";
  if (window.promptEvent) {
    promptEvent.prompt();

    const choice = await promptEvent.userChoice;
    if (choice.outcome === "dismissed") {
      console.log("user dismissed install");
    }
  }
}

function closeCreatePostModal() {
  createPostArea.style.display = "none";
  imagePickerArea.style.display = "none";
  videoPlayer.style.display = "none";
  canvasEl.style.display = "none";
}

shareImageButton.addEventListener("click", openCreatePostModal);

closeCreatePostModalButton.addEventListener("click", closeCreatePostModal);

const clearcard = () => {
  while (sharedMomentsArea.hasChildNodes()) {
    sharedMomentsArea.removeChild(sharedMomentsArea.lastChild);
  }
};

function createCard(color, data) {
  var cardWrapper = document.createElement("div");
  cardWrapper.className = "shared-moment-card mdl-card mdl-shadow--2dp";
  var cardTitle = document.createElement("div");
  cardTitle.className = "mdl-card__title";
  cardTitle.style.backgroundImage = `url(${data?.image})`;
  cardTitle.style.backgroundSize = "cover";
  cardTitle.style.height = "180px";
  cardWrapper.appendChild(cardTitle);
  var cardTitleTextElement = document.createElement("h2");
  cardTitleTextElement.className = "mdl-card__title-text";
  cardTitleTextElement.textContent = data.title;
  cardTitleTextElement.style.color = color;
  cardTitle.appendChild(cardTitleTextElement);
  var cardSupportingText = document.createElement("div");
  cardSupportingText.className = "mdl-card__supporting-text";
  cardSupportingText.textContent = data.location;
  cardSupportingText.style.textAlign = "center";
  if (window.caches) {
    const btn = document.createElement("button");
    btn.textContent = "save";
    btn.addEventListener("click", async function (e) {
      console.log("clicked");
      const userCache = await caches.open("userV1");
      userCache.addAll([
        "https://httpbin.org/get",
        "../../src/images/main-image-sm.jpg",
      ]);
    });
    cardSupportingText.appendChild(btn);
  }
  cardWrapper.appendChild(cardSupportingText);
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}

let networkData = false;
let urlLink = "https://impactapi-default-rtdb.firebaseio.com/posts.json";

try {
  fetch(urlLink)
    .then(function (res) {
      networkData = true;
      return res.json();
    })
    .then(function (data) {
      clearcard();
      const dataArr = [];
      for (let key in data) {
        dataArr.push(data[key]);
      }
      for (let i = 0; i < dataArr.length; i++) {
        createCard("blue", dataArr[i]);
      }
    });
} catch (error) {
  console.log(error);
}

(async () => {
  if (!networkData) {
    if (window.idb) {
      // console.log("no net");
      const db = await dataBase;
      const tx = db.transaction("posts", "readonly");

      const store = tx.objectStore("posts");

      const data = await store.getAll();

      for (let i = 0; i < data.length; i++) {
        createCard("red", data[i]);
      }

      // console.log(data);
    }
  }
})();

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  console.log("submitted");
  if (titleInput.value.trim() === "" || locationInput.value.trim() === "") {
    alert("Please enter valid data");
    return;
  }
  closeCreatePostModal();

  // bg from user interaction.
  if (navigator.serviceWorker) {
    if (window.SyncManager) {
      const sw = await navigator.serviceWorker.ready;
      console.log(sw);
      const post = {
        id: new Date().toISOString(),
        title: titleInput.value,
        location: locationInput.value,
      };

      if (window.idb) {
        const db = await dataBase;
        const tx = db.transaction("sync-post", "readwrite");
        const store = tx.objectStore("sync-post");
        console.log(store);
        store.put(post, "formData");
        tx.complete;
        sw.sync.register("sync-task-postreq");
        console.log("added to sync");
      }
    } else {
      // if syncmanager not supported.
      const post = {
        id: new Date().toISOString(),
        title: titleInput.value,
        location: locationInput.value,
        image:
          "https://firebasestorage.googleapis.com/v0/b/impactapi.appspot.com/o/sanfranBridge.jpg?alt=media&token=72665174-c13b-4411-b4c3-128dc3855d5e",
      };
      const res = await fetch(urlLink, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: post,
      });
    }
  } else {
    // if service worker not supported.
    const post = {
      id: new Date().toISOString(),
      title: titleInput.value,
      location: locationInput.value,
      image:
        "https://firebasestorage.googleapis.com/v0/b/impactapi.appspot.com/o/sanfranBridge.jpg?alt=media&token=72665174-c13b-4411-b4c3-128dc3855d5e",
    };
    const res = await fetch(urlLink, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: post,
    });
  }
});
