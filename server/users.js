const mongoose = require("mongoose");
const Joi = require("joi");
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
    const savedUser = await user.save();
    return { user: savedUser };
  } catch (ex) {
    for (field in ex.errors) console.log(ex.errors[field].message);
  }
}

// get user by socket id
async function getUser(socketIdOrName) {
  const user = await User.findOne({
    $or: [{ socketId: socketIdOrName }, { name: socketIdOrName }],
  });
  return user;
}

//update room name in existing user
async function updateUserRoom(name, room) {
  return await User.findOneAndUpdate({ name }, { room }, { new: true });
}

// delete user
async function deleteUser(socketId) {
  const deletedUser = await User.deleteOne({ socketId });
  console.log("DELETED");
  return deletedUser;
}

module.exports = {
  addUser,
  getUser,
  updateUserRoom,
  deleteUser,
  validateUser,
};
