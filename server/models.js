const mongoose = require("mongoose");
mongoose.set("useCreateIndex", true); //fix deprecation warning

const userSchema = new mongoose.Schema({
  _id: String,
  name: { type: String, default: "", unique: true },
  room: String,
  password: { type: String, default: "" },
});

const roomSchema = new mongoose.Schema({
  _id: String,
  creator: String,
  users: [
    {
      _id: String,
      name: { type: String, default: "", unique: true },
      room: String,
      password: { type: String, default: "" },
    },
  ],
  messages: [
    {
      user: String,
      text: String,
    },
  ],
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
      messages: [{ user: String, text: String }],
      count: Number,
    },
  ],
});

//create User model
const User = mongoose.model("User", userSchema);
const Room = mongoose.model("Room", roomSchema);

//
const newUser = mongoose.model("newUser", newUserSchema);

module.exports = { User, Room };
