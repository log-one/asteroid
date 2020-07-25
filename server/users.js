const mongoose = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const config = require("config");
const { makeCommonRoomName } = require("./queue");
const { getRoom } = require("./rooms");
mongoose.set("useCreateIndex", true); //fix deprecation warning

//create user schema
const userSchema = new mongoose.Schema({
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
  friends: {
    type: Array,
    default: [],
  },

  rooms: {
    type: Array,
    default: [],
  },
  currentRoom: { type: String, default: "" },
  usersMet: { type: Array, default: [] },
  messagesSent: { type: Number, default: 0 },
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

//add to users met
async function addToUsersMet(name, human) {
  try {
    return await User.findOneAndUpdate(
      { name },
      { $addToSet: { usersMet: human } },
      { new: true }
    );
  } catch (err) {
    console.log("Failed to update number of users met", err);
  }
}

//add to messages sent
async function incrementMessagesSent(name) {
  try {
    return await User.findOneAndUpdate(
      { name },
      { $inc: { messagesSent: 1 } },
      { new: true }
    );
  } catch (err) {
    console.log("Failed to update number of messages sent", err);
  }
}

//create new user
async function addUser(name, password) {
  name = name.trim().toLowerCase();

  // else make a 'user' object and save it as a document in the db
  const user = new User({ name, password, currentRoom: `#home/${name}` });
  try {
    return await user.save();
  } catch (ex) {
    for (field in ex.errors) console.log(ex.errors[field].message);
  }
}

// get user by socket id
async function getUser(userName) {
  try {
    return await User.findOne({
      name: userName,
    });
  } catch (err) {
    console.log("Failed to get user", err);
  }
}

//update currentRoom in existing user
async function updateUserRoom(name, currentRoom) {
  try {
    return await User.findOneAndUpdate(
      { name },
      { currentRoom },
      { new: true }
    );
  } catch (err) {
    console.log("Failed to update user's room", err);
  }
}

async function getUsersOnlineInRoom(roomName) {
  try {
    const findResult = await User.find(
      { currentRoom: roomName },
      { name: 1, _id: 0 }
    );

    return findResult.map((result) => result.name);
  } catch (err) {
    console.log("Failed to get online users in room", err);
  }
}

//Get peer from room name for one-on-one chat
function getPeerFromRoom(roomName, userName) {
  const afterSlash = roomName.substring(roomName.indexOf("/") + 1);
  const peerName = afterSlash.replace(userName, "").replace("#", "");
  return peerName;
}

//add friends to users friends list
async function addNewFriend(userName, friendName) {
  try {
    return await User.findOneAndUpdate(
      { name: userName },
      { $addToSet: { friends: friendName } },
      { new: true }
    );
  } catch (err) {
    console.log("Failed to add friend to friends list", err);
  }
}

//add friends to users friends list
async function removeFriend(userName, friendName) {
  try {
    return await User.findOneAndUpdate(
      { name: userName },
      { $pull: { friends: friendName } },
      { new: true }
    );
  } catch (err) {
    console.log("Failed to remove friend from friends list", err);
  }
}

async function getFriendsAndMsgs(userName) {
  try {
    const user = await getUser(userName);

    let friendsAndMsgs = await Promise.all(
      user.friends.map(async (friend) => {
        let room = await getRoom(makeCommonRoomName(userName, friend));
        console.log(room.name);
        let length = room.messages.length;
        let newFriend = {
          userName: friend,
          lastMessage: length ? room.messages[length - 1].text : "...",
        };
        return newFriend;
      })
    );
    return friendsAndMsgs;
  } catch (ex) {
    console.log("Failed to get friends and last messages:", ex);
  }
}

//add room to users rooms list
async function addRoomToUser(userName, roomName) {
  try {
    return await User.findOneAndUpdate(
      { name: userName },
      { $addToSet: { rooms: roomName } },
      { new: true }
    );
  } catch (err) {
    console.log("Failed to add room to user's rooms list", err);
  }
}

async function removeRoomFromUser(userName, roomName) {
  try {
    return await User.findOneAndUpdate(
      { name: userName },
      { $pull: { rooms: roomName } },
      { new: true }
    );
  } catch (err) {
    console.log("Failed to remove room from user's rooms list", err);
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
  addNewFriend,
  removeFriend,
  getPeerFromRoom,
  addRoomToUser,
  removeRoomFromUser,
  getUsersOnlineInRoom,
  getFriendsAndMsgs,
  incrementMessagesSent,
  addToUsersMet,
};
