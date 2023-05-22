const http = require("http");
const express = require("express");
const cors = require("cors");
const buffer = require("buffer");
const fs = require("fs/promises");
const webPush = require("web-push");

const app = express();

app.use(cors());
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
const publicKey =
  "BJTnb4WHULLLnmRmPOhqrf6rQGJ7KYmcQ3XNzieAvFqtomw47Je3uFJnLtI1UIzekfLRjm3stdOejndX81vKUqs";

const url64To8bitArr = (url64) => {
  let padding = "=".repeat((4 - (url64.length % 4)) % 4);
  let base64 = (url64 + padding).replace(/\-/g, "+").replace(/_/g, "/");

  let rawData = buffer.atob(base64);
  let outPutArr = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i++) {
    outPutArr[i] = rawData.charCodeAt(i);
  }
  console.log(outPutArr);
  return outPutArr;
};
// url64To8bitArr(publicKey);
const addToStore = async (newSub) => {
  try {
    const subs = await fs.readFile("./testStore.json");
    const subsObj = JSON.parse(subs);
    const subArr = [...subsObj.subscriptions, newSub];
    subsObj.subscriptions = subArr;
    const subsObjStr = JSON.stringify(subsObj);

    await fs.writeFile("./testStore.json", subsObjStr);

    return;
  } catch (error) {
    console.log(error);
  }
};

const getLatestSub = async () => {
  const subs = await fs.readFile("./testStore.json");
  const subsObj = JSON.parse(subs);
  const { subscriptions } = subsObj;
  return subscriptions[subscriptions.length - 1];
};

const webPusher = async (sub, payload) => {
  webPush
    .sendNotification(sub, "new notification")
    .then((data) => {
      console.log(data);
    })
    .catch((error) => {
      console.log(error);
    });
};

const setConfigAndPush = async () => {
  webPush.setVapidDetails(
    "mailto:michaels.david@abuad.edu.ng",
    "BG9dVArZzNYaX3tzQ1stnwd1fN5Oluj5-SypfucipzyuVpWxAePsWQuHV2pjPnIGz2JZbcMMystFwcQraddDQKs",
    "Z9F2rUNRatbOhBaU6_jgTT3AbGh5ay7stZkeDJ4r34c"
  );

  const subFromStore = await getLatestSub();
  console.log(subFromStore);

  const pushConfig = {
    endpoint: subFromStore.endpoint,
    keys: {
      auth: subFromStore.keys.auth,
      p256dh: subFromStore.keys.p256dh,
    },
  };

  const jsonPush = JSON.stringify({
    title: "push notification",
    content: "testing new push notification",
  });
  console.log();

  await webPusher(pushConfig, jsonPush);
};

app.post("/addSub", async (req, res) => {
  try {
    console.log("incoming request, add to sub");
    const subObj = req.body;
    const lastSub = await addToStore(subObj);

    res.end("sub added");
  } catch (error) {
    console.log(error);
    return res.end("error");
  }
});

app.post("/subs", async (req, res) => {
  try {
    console.log("incoming request, send push");

    await setConfigAndPush();
    res.end("push sent");
  } catch (error) {
    console.log(error);
    return res.end("error");
  }
});

app.listen(3000, () => {
  console.log("server is up...");
});
