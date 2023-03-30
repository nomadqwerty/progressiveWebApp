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

function createCard() {
  var cardWrapper = document.createElement("div");
  cardWrapper.className = "shared-moment-card mdl-card mdl-shadow--2dp";
  var cardTitle = document.createElement("div");
  cardTitle.className = "mdl-card__title";
  cardTitle.style.backgroundImage = 'url("../../src/images/main-image-sm.jpg")';
  cardTitle.style.backgroundSize = "cover";
  cardTitle.style.height = "180px";
  cardWrapper.appendChild(cardTitle);
  var cardTitleTextElement = document.createElement("h2");
  cardTitleTextElement.className = "mdl-card__title-text";
  cardTitleTextElement.textContent = "west Francisco Trip";
  cardTitleTextElement.style.color = "yellow";
  cardTitle.appendChild(cardTitleTextElement);
  var cardSupportingText = document.createElement("div");
  cardSupportingText.className = "mdl-card__supporting-text";
  cardSupportingText.textContent = "In San Francisco";
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

console.log(window);

fetch("https://httpbin.org/get")
  .then(function (res) {
    return res.json();
  })
  .then(function (data) {
    createCard();
  });
