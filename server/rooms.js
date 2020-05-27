const mongoose = require("mongoose");
mongoose.set("useCreateIndex", true); //fix deprecation warning

//create Room schema
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

//create Room model
const Room = mongoose.model("Room", roomSchema);

//add a new room to 'Rooms' collection
async function addRoom(name, creator) {
  const room = new Room({ _id: name, creator });
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
  return await Room.findById(name);
}

async function addUserToRoom(roomId, user) {
  return await Room.findByIdAndUpdate(
    roomId,
    { $push: { users: user } },
    { new: true }
  );
}

async function removeUserFromRoom(roomId, user) {
  return await Room.findByIdAndUpdate(
    roomId,
    { $pull: { users: { name: user.name } } },
    { new: true }
  );
}

async function addMessageToRoom(roomId, message) {
  return await Room.findByIdAndUpdate(
    roomId,
    { $push: { messages: message } },
    { new: true }
  );
}

async function removeRoom(id) {
  const deletedRoom = await Room.deleteOne({ _id: id });
  return deletedRoom;
}

module.exports = {
  addRoom,
  getRoom,
  addUserToRoom,
  removeUserFromRoom,
  addMessageToRoom,
  removeRoom,
};
