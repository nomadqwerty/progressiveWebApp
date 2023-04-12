var shareImageButton = document.querySelector("#share-image-button");
var createPostArea = document.querySelector("#create-post");
var closeCreatePostModalButton = document.querySelector(
  "#close-create-post-modal-btn"
);
var sharedMomentsArea = document.querySelector("#shared-moments");

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
fetch(urlLink)
  .then(function (res) {
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

if (!networkData) {
  if (window.caches) {
    window.caches
      .match(urlLink)
      .then((res) => {
        if (res) {
          return res.json();
        }
      })
      .then((res) => {
        if (res) {
          clearcard();
          createCard("red");
        }
      });
  }
}
