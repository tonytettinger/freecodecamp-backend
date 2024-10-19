// index.js
// where your node app starts

// init project
var express = require("express");
var app = express();

function isValidDate(date) {
  return new Date(date) !== "Invalid Date" && !isNaN(new Date(date));
}

function isUnixDate(date) {
  let isNum = /^\d+$/.test(date);
  console.log(isNum);
  let isLength13 = date.length === 13;
  return isNum && isLength13;
}

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC
var cors = require("cors");
app.use(cors({ optionsSuccessStatus: 200 })); // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function(req, res) {
  res.sendFile(__dirname + "/views/index.html");
});

app.get("/api/:date?", function(req, res) {
  if (req.params.date === undefined) {
    const date = Date.now();
    const dateObj = new Date(date);
    res.json({
      unix: Math.floor(dateObj.getTime()),
      utc: dateObj.toUTCString(),
    });
  } else if (isValidDate(new Date(req.params.date))) {
    const date = new Date(req.params.date);
    res.json({ unix: Math.floor(date.getTime()), utc: date.toUTCString() });
  } else if (isUnixDate(req.params.date)) {
    res.json({
      utc: new Date(Number(req.params.date)).toUTCString(),
      unix: Number(req.params.date),
    });
  } else {
    res.json({ error: "Invalid Date" });
  }
});

// your first API endpoint...
app.get("/api/hello", function(req, res) {
  res.json({ greeting: "hello API" });
});

// Listen on port set in environment variable or default to 3000
var listener = app.listen(process.env.PORT || 3000, function() {
  console.log("Your app is listening on port " + listener.address().port);
});
