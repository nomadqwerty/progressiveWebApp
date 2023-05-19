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

app.post("/subs", async (req, res) => {
  try {
    const subObj = req.body;
    await addToStore(subObj);

    webPush.setVapidDetails(
      "mailto:support@prowebdev-consultants.com",
      "BJTnb4WHULLLnmRmPOhqrf6rQGJ7KYmcQ3XNzieAvFqtomw47Je3uFJnLtI1UIzekfLRjm3stdOejndX81vKUqs",
      "Eg8zE5OhxZQeR5vQfO_mCGfc6sMLqIORptj93_FQpPQ"
    );

    const subFromStore = await getLatestSub();

    const pushConfig = {
      endpoint: subFromStore.endpoint,
      keys: {
        auth: subFromStore.keys.auth,
        p256dh: subFromStore.keys.p256dh,
      },
    };

    webPush
      .sendNotification(
        pushConfig,
        JSON.stringify({
          title: "push notification",
          content: "testing new push notification",
        })
      )
      .catch((err) => {
        console.log(err);
      });
    return res.end("recieved");
  } catch (error) {
    console.log(error);
    return res.end("error");
  }
});

app.listen(3000, () => {
  console.log("server is up...");
});
