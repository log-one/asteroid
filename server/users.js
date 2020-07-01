const mongoose = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const config = require("config");
mongoose.set("useCreateIndex", true); //fix deprecation warning

//create user schema
const userSchema = new mongoose.Schema({
  socketId: {
    type: String,
    default: "tbd",
  },
  name: {
    type: String,
    default: "",
    required: true,
    unique: true,
    minlength: 1,
    maxLength: 15,
  },
  password: {
    type: String,
    default: "",
    required: true,
    minlength: 8,
    maxLength: 1024,
  },
  room: { type: String, default: "" },
});

//define method in user object

userSchema.methods.genAuthToken = function () {
  //pass payload and private key to generate jwt token
  const token = jwt.sign({ name: this.name }, config.get("jwtPrivateKey"));
  return token;
};

//validation function

function validateUser(user) {
  const schema = {
    name: Joi.string().min(1).max(15).required(),
    password: Joi.string().min(8).max(50).required(),
  };

  return Joi.validate(user, schema);
}

//create User model
const User = mongoose.model("User", userSchema);

//create new user
async function addUser(name, password) {
  name = name.trim().toLowerCase();

  // else make a 'user' object and save it as a document in the db
  const user = new User({ name, password, room: `#home/${name}` });
  try {
    return await user.save();
  } catch (ex) {
    for (field in ex.errors) console.log(ex.errors[field].message);
  }
}

// get user by socket id
async function getUser(socketIdOrName) {
  try {
    return await User.findOne({
      $or: [{ socketId: socketIdOrName }, { name: socketIdOrName }],
    });
  } catch (err) {
    console.log("Failed to get user", err);
  }
}

//update room name in existing user
async function updateUserRoom(name, room) {
  try {
    return await User.findOneAndUpdate({ name }, { room }, { new: true });
  } catch (err) {
    console.log("Failed to update user's room", err);
  }
}

//update socket ID of user
async function updateSocketId(name, socketId) {
  try {
    return await User.findOneAndUpdate({ name }, { socketId }, { new: true });
  } catch (err) {
    console.log("Failed to update user's socketId", err);
  }
}

// delete user
async function deleteUser(socketId) {
  try {
    return await User.deleteOne({ socketId });
  } catch (err) {
    console.log("Failed to delete user", err);
  }
}

module.exports = {
  addUser,
  getUser,
  updateUserRoom,
  deleteUser,
  validateUser,
  updateSocketId,
};
