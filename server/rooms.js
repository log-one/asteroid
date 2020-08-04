const mongoose = require("mongoose");
mongoose.set("useCreateIndex", true); //fix deprecation warning

//create Room schema UPDATE USERS EMBEDD DOC PROPERLY CHECK MOSH
const roomSchema = new mongoose.Schema({
  name: String,
  creator: String,
  users: {
    type: Array,
    default: [],
  },
  messages: [
    {
      user: String,
      text: String,
      link: String,
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

//get array of room members with updated online statuses
async function getUpdatedRoomMembers(roomName, offlineUser) {
  const { getUsersOnlineInRoom } = require("./users");

  try {
    //get users currently online in room
    const onlineUsers = await getUsersOnlineInRoom(roomName);

    //get room document
    const room = await getRoom(roomName);

    //create array of room members with updated online statuses
    const roomMembers = room.users.map((roomMember) =>
      onlineUsers.includes(roomMember)
        ? { name: roomMember, online: true }
        : { name: roomMember, online: false }
    );

    //if a user just left the room, update their online status
    if (offlineUser) {
      const index = roomMembers.findIndex(
        (roomMember) => roomMember.name === offlineUser
      );
      if (index > -1) roomMembers[index].online = false;
    }

    return roomMembers;
  } catch (ex) {
    console.log("Failed to get updated online room members:", ex);
  }
}

async function getRoom(name) {
  if (name.slice(0, 2) === "dm") name = name.replace("dm", "");
  return await Room.findOne({ name });
}

async function addUserToRoom(name, user) {
  try {
    if (name.slice(0, 2) === "dm") name = name.replace("dm", "");

    return await Room.findOneAndUpdate(
      { name },
      { $addToSet: { users: user } },
      { new: true }
    );
  } catch (err) {
    console.log("Failed to add user to room", err);
  }
}

async function removeUserFromRoom(name, user) {
  try {
    if (name.slice(0, 2) === "dm") name = name.replace("dm", "");

    return await Room.findOneAndUpdate(
      { name },
      { $pull: { users: user } },
      { new: true }
    );
  } catch (err) {
    console.log("Failed to remove user from room", err);
  }
}

async function addMessageToRoom(name, message) {
  try {
    if (name.slice(0, 2) === "dm") name = name.replace("dm", "");
    console.log(name);
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
    if (name.slice(0, 2) === "dm") name = name.replace("dm", "");

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
  getUpdatedRoomMembers,
};
