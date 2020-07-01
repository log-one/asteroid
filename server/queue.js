const { getUser, updateUserRoom } = require("./users.js");

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

function removeFromQueue(id) {
  const index = queue.findIndex((sock) => sock.id === id);
  if (index > -1) queue.splice(index, 1);
  console.log("QUEUE", index);
  return;
}

function getSocket(io, id) {
  return io.of("/").connected[id];
}

async function FindPeerForLoneSocket(socket) {
  const user = await getUser(socket.id);

  if (queueIsEmpty()) {
    enqueue(socket);
    return;
  } else {
    const peerSocket = dequeue(); //get the first socket in queue

    const peer = await getUser(peerSocket.id); //get User document connected to first socket

    //decide order of usernames in room name
    const roomName =
      user.name < peer.name
        ? `#chat/${user.name}#${peer.name}`
        : `#chat/${peer.name}#${user.name}`;

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

    //get room if it already exists
    let room = await getRoom(roomName);
    console.log(room);

    //clear waiting message for both sockets
    peerSocket.emit("clear-messages");
    socket.emit("clear-messages");

    //if room exists
    if (room) {
      //send stored messages to both clients
      socket.emit("load-prev-messages", room.messages);
      peerSocket.emit("load-prev-messages", room.messages);
      console.log("loading  prev msgs...");

      //send welcome message
      socket.emit("message", {
        user: "admin",
        text: `${user.name} and ${peer.name} meet again!`,
      });
      peerSocket.emit("message", {
        user: "admin",
        text: `${user.name} and ${peer.name} meet again!`,
      });
    } else {
      //create room in DB if it doesn't already exist
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

    // add both users to users array in Room document
    await addUserToRoom(roomName, user);
    await addUserToRoom(roomName, peer);
  }
}

module.exports = {
  getSocket,
  enqueue,
  dequeue,
  queueIsEmpty,
  FindPeerForLoneSocket,
  removeFromQueue,
};
