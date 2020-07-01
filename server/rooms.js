const mongoose = require("mongoose");
mongoose.set("useCreateIndex", true); //fix deprecation warning

//create Room schema UPDATE USERS EMBEDD DOC PROPERLY CHECK MOSH
const roomSchema = new mongoose.Schema({
  name: String,
  creator: String,
  users: [
    {
      _id: String,
      name: { type: String, default: "" },
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

//create Room model
const Room = mongoose.model("Room", roomSchema);

//add a new room to 'Rooms' collection
async function addRoom(name, creator) {
  const room = new Room({ name, creator });
  try {
    return await room.save();
  } catch (err) {
    console.log("Failed to add room", err);
  }
}

//UPDATE ROOM MESSAGES FUNCTION HERE

async function getRoom(name) {
  return await Room.findOne({ name });
}

async function addUserToRoom(name, user) {
  try {
    return await Room.findOneAndUpdate(
      { name },
      { $push: { users: user } },
      { new: true }
    );
  } catch (err) {
    console.log("Failed to add user to room", err);
  }
}

async function removeUserFromRoom(name, user) {
  try {
    return await Room.findOneAndUpdate(
      { name },
      { $pull: { users: { name: user.name } } },
      { new: true }
    );
  } catch (err) {
    console.log("Failed to remove user from room", err);
  }
}

async function addMessageToRoom(name, message) {
  try {
    return await Room.findOneAndUpdate(
      { name },
      { $push: { messages: message } },
      { new: true }
    );
  } catch (err) {
    console.log("Failed to add message to room", err);
  }
}

async function deleteRoom(name) {
  try {
    return await Room.deleteOne({ name });
  } catch (err) {
    console.log("Failed to delete room", err);
  }
}

module.exports = {
  addRoom,
  getRoom,
  addUserToRoom,
  removeUserFromRoom,
  addMessageToRoom,
  deleteRoom,
};
