const { addRoom, getRoom, addUserToRoom } = require("./rooms.js");

//initialize empty queue of sockets
const queue = [];

function enqueue(socket) {
  queue.push(socket);
}

function queueIsEmpty() {
  return queue.length === 0 ? true : false;
}

function dequeue() {
  return queue.shift();
}

function removeFromQueue(userName) {
  const index = queue.findIndex((sock) => sock.userName === userName);
  if (index > -1) queue.splice(index, 1);
  return;
}

function makeCommonRoomName(userName, peerName) {
  return userName < peerName
    ? `#chat/${userName}#${peerName}`
    : `#chat/${peerName}#${userName}`;
}

async function findPeerForLoneSocket(socket) {
  const { getUser, updateUserRoom, addToUsersMet } = require("./users.js");

  try {
    let user = await getUser(socket.userName);

    if (queueIsEmpty()) {
      enqueue(socket);
      return;
    } else {
      const peerSocket = dequeue(); //get the first socket in queue

      if (peerSocket.userName === socket.userName) {
        peerSocket.leave(`#queue/${peerSocket.userName}`);
        enqueue(socket);
        return;
      }

      //get User document of peer socket
      const peer = await getUser(peerSocket.userName);

      //make a consistent room name using the names of both users
      const roomName = makeCommonRoomName(user.name, peer.name);

      //every unique pair of matched users will have one unique persistant room in the database where they can pick up where they left off if randomly matched multiple times

      //leave #queue
      socket.leave(`#queue/${user.name}`);
      peerSocket.leave(`#queue/${peer.name}`);

      // join both sockets to room
      socket.join(roomName);
      peerSocket.join(roomName);

      //update room for user and peer
      await updateUserRoom(user.name, roomName);
      await updateUserRoom(peer.name, roomName);

      //update usersMet in database for both users
      await addToUsersMet(user.name, peer.name);
      await addToUsersMet(peer.name, user.name);

      //clear waiting message for both sockets
      peerSocket.emit("clear-messages");
      socket.emit("clear-messages");

      //emit infoBar details to both clients
      socket.emit("infoBarText", {
        creator: "",
        roomName: peerSocket.userName,
      });
      peerSocket.emit("infoBarText", {
        creator: "",
        roomName: socket.userName,
      });

      //get room if it already exists
      let room = await getRoom(roomName);

      //if room exists...
      if (room) {
        //send stored messages to both clients
        socket.emit("load-prev-messages", room.messages);
        peerSocket.emit("load-prev-messages", room.messages);

        //send welcome message to both clients
        socket.emit("message", {
          user: "admin",
          text: `${user.name} and ${peer.name} meet again!`,
        });
        peerSocket.emit("message", {
          user: "admin",
          text: `${user.name} and ${peer.name} meet again!`,
        });
      } else {
        //if room does not exist...

        //create room in db
        room = await addRoom(roomName, roomName.slice(6, roomName.length));

        // welcome message for socket
        socket.emit("message", {
          user: "admin",
          text: `${user.name} and ${peer.name} meet for the first time!`,
        });

        // welcome message for peer socket
        peerSocket.emit("message", {
          user: "admin",
          text: `${user.name} and ${peer.name} meet for the first time!`,
        });
      }

      //emit random but opposite canSpeak booleans to both sockets
      const canSpeakBoolean = Math.random() < 0.5 ? true : false;
      peerSocket.emit("can-speak", canSpeakBoolean);
      socket.emit("can-speak", !canSpeakBoolean);
      console.log("canSpeakBoolean", canSpeakBoolean); //DEV CONSOLE

      // add both users to users array in Room document
      await addUserToRoom(roomName, user.name);
      await addUserToRoom(roomName, peer.name);
    }
  } catch (ex) {
    console.log("Unable to find peer for lone socket: ", ex);
  }
}

module.exports = {
  enqueue,
  dequeue,
  queueIsEmpty,
  findPeerForLoneSocket,
  removeFromQueue,
  makeCommonRoomName,
};
