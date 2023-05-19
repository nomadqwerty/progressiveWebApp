const http = require("http");
const express = require("express");
const cors = require("cors");
const buffer = require("buffer");

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

app.post("/subs", (req, res) => {
  console.log(req.body);
  res.end("recieved");
});

app.listen(3000, () => {
  console.log("server is up...");
});
