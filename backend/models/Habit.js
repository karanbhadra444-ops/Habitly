const mongoose = require("mongoose");

const habitSchema = new mongoose.Schema({
  text: String,
  history: Object,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
});

module.exports = mongoose.model(
  "Habit",
  habitSchema
);