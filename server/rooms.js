const mongoose = require("mongoose");
mongoose.set("useCreateIndex", true); //fix deprecation warning

//create Room schema UPDATE USERS EMBEDD DOC PROPERLY CHECK MOSH
const roomSchema = new mongoose.Schema({
  name: String,
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

//create Room model
const Room = mongoose.model("Room", roomSchema);

//add a new room to 'Rooms' collection
async function addRoom(name, creator) {
  const room = new Room({ name, creator });
  try {
    const savedRoom = await room.save();

    return savedRoom;
  } catch (err) {
    console.log(err);
    return { error: "Room already exists" }; //might have to change this if im saving even peer#peer rooms to allow people to connect again
  }
}

//UPDATE ROOM MESSAGES FUNCTION HERE

async function getRoom(name) {
  return await Room.findOne({ name });
}

async function addUserToRoom(name, user) {
  return await Room.findOneAndUpdate(
    { name },
    { $push: { users: user } },
    { new: true }
  );
}

async function removeUserFromRoom(name, user) {
  return await Room.findOneAndUpdate(
    { name },
    { $pull: { users: { name: user.name } } },
    { new: true }
  );
}

async function addMessageToRoom(name, message) {
  return await Room.findOneAndUpdate(
    { name },
    { $push: { messages: message } },
    { new: true }
  );
}

async function deleteRoom(name) {
  const deletedRoom = await Room.deleteOne({ name });
  return deletedRoom;
}

module.exports = {
  addRoom,
  getRoom,
  addUserToRoom,
  removeUserFromRoom,
  addMessageToRoom,
  deleteRoom,
};
