const mongoose = require("mongoose");
mongoose.set("useCreateIndex", true); //fix deprecation warning

const userSchema = new mongoose.Schema({
  _id: String,
  name: { type: String, default: "", unique: true },
  room: { type: String, default: "" },
});

const newUserSchema = new mongoose.Schema({
  _id: String,
  name: { type: String, default: "", required: true, unique: true },
  password: { type: String, required: true },
  stats: {
    humansMet: Number,
    messagesSent: Number,
  },
  conversations: [
    {
      roomName: String,
      opponent: String,
      messages: [{ sender: String, message: String }],
      count: Number,
    },
  ],
});

//create User model
const User = mongoose.model("User", userSchema);
const newUser = mongoose.model("newUser", newUserSchema);

module.exports = User;
