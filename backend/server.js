const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const Habit = require("./models/Habit");
const User = require("./models/User");
const auth = require("./middleware/auth");
const cors=require("cors");
const axios = require("axios");
const bcrypt = require("bcryptjs");

const app = express();


mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch((err) => console.log(err));

app.use(cors());

app.use(express.json());

app.get("/habits", auth, async (req, res) => {
  const habits = await Habit.find({
    userId: req.user.id
  });

  res.json(habits);
});
app.get("/stats/completed-today", auth, async (req, res) => {
  const today = new Date().toISOString().split("T")[0];
  const habits = await Habit.find({
    userId: req.user.id
  });
  const completeCount = habits.filter(
    (h) => h.history && h.history[today]
  ).length;
  res.json({ completedToday: completeCount });
});

app.post("/habits", auth, async (req, res) => {
  const newHabit = new Habit({
    text: req.body.text,
    history: {},
    userId: req.user.id
  });

  await newHabit.save();

  const habits = await Habit.find({
    userId: req.user.id
  });

  res.json({ habits });
});


app.delete("/habits/:id",auth, async (req, res) => {
  await Habit.findOneAndDelete({
  _id: req.params.id,
  userId: req.user.id
});
  const habits = await Habit.find({
  userId: req.user.id
});
  res.json({
    message: "Habit deleted",
    habits
  });
}); 
app.put("/habits/:id", auth, async (req, res) => {
  const updated = await Habit.findOneAndUpdate(
    {
      _id: req.params.id,
      userId: req.user.id
    },
    req.body,
    {
      returnDocument: "after"
    }
  );

  res.json(updated);
});


app.post("/ai-suggestions", auth, async (req, res) => {
  try {
    const { goal } = req.body;
    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",

        messages: [
          {
            role: "system",
            content: "You are a habit coach."
          },
          {
            role: "user",
            content: `
                    Suggest 5 short daily habits for this goal:
                    ${goal}

                    Return only bullet points.
                    `
          }
        ]
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`
        }
      }
    );
    const text =
      response.data.choices[0].message.content;
    res.json({
      suggestions: text
    });
  } catch (err) {
    console.log(
      err.response?.data || err.message
    );
    res.status(500).json({
      error: "AI failed"
    });
  }
});
app.post("/signup", async (req, res) => {

  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }
    const hashedPassword =
      await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashedPassword
    });
    res.json({
      message: "Signup successful",
      user
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Signup failed"
    });
  }
});
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "User not found"
      });
    }
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );
    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid password"
      });
    }
    const token = jwt.sign(
      {
        id: user._id
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );
    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Login failed"
    });
  }
});
app.listen(5000, () => {
  console.log("Server running on port 5000");
});

