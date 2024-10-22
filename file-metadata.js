var express = require("express");
var cors = require("cors");
require("dotenv").config();
var busboy = require("connect-busboy");
var app = express();

app.use(busboy());
app.use(cors());
app.use("/public", express.static(process.cwd() + "/public"));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

app.post("/api/fileanalyse", (req, res) => {
  if (req.busboy) {
    req.busboy.on("file", function (name, file, info) {
      let fileSize = 0;
      file.on("data", (data) => {
        fileSize += data.length;
      });
      file.on("close", () => {
        res.json({ name: info.filename, type: info.mimeType, size: fileSize });
      });
    });
    return req.pipe(req.busboy);
  }
});

const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("Your app is listening on port " + port);
});
