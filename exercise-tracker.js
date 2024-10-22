const express = require("express");
const app = express();
var cors = require("cors");
require("dotenv").config();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_DB);
app.use(cors());

const exerciseSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
  },
  { versionKey: false },
);

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    require: true,
  },
});

const User = mongoose.model("User", userSchema);
const Exercise = mongoose.model("Exercise", exerciseSchema);

app.use(bodyParser.urlencoded({ extended: true }));
app.post("/api/users", (req, res) => {
  const user = new User({
    username: req.body.username,
  });

  user
    .save()
    .then((savedUser) => {
      return res
        .status(201)
        .json({ username: savedUser.username, _id: savedUser._id });
    })
    .catch((err) => res.status(500).json({ error: err }));
});

app.get("/api/users", async (_, res) => {
  try {
    const users = await User.find({})
      .select({ _id: true, username: true })
      .exec();
    res.json(users);
  } catch {
    res.status(500).json({ error: "Couldnt return user list" });
  }
});

app.post("/api/users/:_id/exercises", async (req, res) => {
  try {
    let { duration, description, date } = req.body;
    if (!date) {
      const timeElapsed = Date.now();
      date = new Date(timeElapsed);
    }

    const dateObject = new Date(date);
    if (dateObject === "Invalid Date") {
      res.json({ error: "Invalid date" });
    } else {
      date = dateObject.toDateString();
    }

    if (description === "") {
      res.json({ error: "Description required" });
    }

    if (duration === "") {
      res.json({ error: "Duration required" });
    }
    const user = await User.findById(req.params._id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const exercise = new Exercise({
      userId: req.params._id,
      description,
      duration: duration,
      date,
    });

    exercise
      .save()
      .then((savedExercise) => {
        return res.status(201).json({
          _id: req.params._id,
          username: user.username,
          description,
          duration: parseInt(duration),
          date,
        });
      })
      .catch((err) => res.status(500).json({ error: err }));
  } catch (err) {
    res.status(500).json({ error: "Could not add exercise" });
  }
});

app.get("/api/users/:_id/logs", async (req, res) => {
  let { from, to, limit } = req.query;
  let filter = { userId: req.params._id };
  if (from || to) {
    filter.date = {};
  }
  if (from) {
    filter.date.$gte = new Date(from);
  }
  if (to) {
    filter.date.$lte = new Date(to);
  }
  if (!limit) {
    limit = 0;
  }

  const user = await User.findById(req.params._id);
  if (!user) {
    return res.status(404).json({ error: "User not found with given id" });
  }

  Exercise.find(filter)
    .select({ userId: false, _id: false })
    .limit(Number(limit))
    .lean()
    .exec()
    .then((exercises) => {
      const numberOfExercises = exercises.length;
      const formattedExercises = exercises.map((exercise) => {
        return { ...exercise, date: exercise.date.toDateString() };
      });

      const exerciseLog = {
        username: user.username,
        count: numberOfExercises,
        _id: req.params._id,
        log: formattedExercises,
      };
      res.json(exerciseLog);
    })
    .catch((err) => {
      console.log("Error retrieving user logs: ", err);
      res.status(500).json({ error: "Failed to retrieve user log from query" });
    });
});

app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
