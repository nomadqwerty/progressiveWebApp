const http = require("http");

http
  .createServer((req, res) => {
    res.end("back end");
  })
  .listen(3000);
