require("dotenv").config();
const express = require("express");
const dns = require("dns");
const cors = require("cors");
const bodyParser = require("body-parser");
const res = require("express/lib/response");
const crypto = require("crypto");
const { readdirSync } = require("fs");
const parseBody = bodyParser.urlencoded({ extended: false });
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

const shortURLList = {};

function generateShortCode() {
  return crypto.randomBytes(4).toString("hex");
}

const isValidURL = (url) => {
  return new Promise((resolve) => {
    try {
      const urlAddress = new URL(url);
      const hostName = urlAddress.hostname;
      dns.lookup(hostName, (err) => {
        if (err) {
          console.log("error looking up given host name: ", hostName);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    } catch {
      console.log("error in parsing URL");
      resolve(false);
    }
  });
};

app.use(cors());
app.use(parseBody);

app.use("/public", express.static(`${process.cwd()}/public`));
app.post("/api/shorturl", async (req, res) => {
  const submittedURL = req.body.url;
  const validURL = await isValidURL(submittedURL);
  if (validURL) {
    const shortCode = generateShortCode();
    shortURLList[shortCode] = submittedURL;
    res.json({ original_url: submittedURL, shorturl: shortCode });
  } else {
    res.json({ error: "invalid url" });
  }
});

app.get("/api/shorturl/:shorturl", (req, res) => {
  if (req.params.shorturl in shortURLList) {
    res.redirect(shortURLList[req.params.shorturl]);
  } else {
    res.json({ error: "shortcode not recognized" });
  }
});
app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
