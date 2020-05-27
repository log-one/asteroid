const mongoose = require("mongoose");
mongoose.set("useCreateIndex", true); //fix deprecation warning

//create user schema
const userSchema = new mongoose.Schema({
  _id: String,
  name: { type: String, default: "", unique: true },
  room: { type: String, default: `#home/${name}` },
  password: { type: String, default: "" },
});

//create User model
const User = mongoose.model("User", userSchema);

//create new user
async function addUser({ id, name, room, password }) {
  name = name.trim().toLowerCase();

  // else make a 'user' object and save it as a document in the db
  const user = new User({ _id: id, name, room, password });
  try {
    const savedUser = await user.save();
    return { user: savedUser };
  } catch {
    return { error: "Username already exists" };
  }
}

// get user by id
async function getUser(id) {
  const user = await User.findById(id);
  return user;
}

//update room name in existing user
async function updateUserRoom(roomName, id) {
  return await User.findByIdAndUpdate(id, { room: roomName }, { new: true });
}

// delete user
async function removeUser(id) {
  const deletedUser = await User.deleteOne({ _id: id });
  console.log("DELETED");
  return deletedUser;
}

module.exports = {
  addUser,
  getUser,
  updateUserRoom,
  removeUser,
};
