const express = require("express");
const path = require("path");
const socketio = require("socket.io");
const mongoose = require("mongoose");
const config = require("config");
const http = require("http");
const cors = require("cors");

const PORT = process.env.PORT || 5000;

const register = require("./routes/register");
const login = require("./routes/login");
const chitApp = require("./routes/chitApp");

const prod = require("./prod");

const app = express();
const server = http.createServer(app);
const io = socketio(server); //create instance of socket.io server
const got = require("got");

//allow CORS
app.use(cors());

const {
  getUser,
  updateUserRoom,
  getPeerFromRoom,
  addNewFriend,
  removeFriend,
  addRoomToUser,
  removeRoomFromUser,
  getFriendsAndMsgs,
  incrementMessagesSent,
} = require("./users.js");

const {
  addRoom,
  deleteRoom,
  getRoom,
  addUserToRoom,
  removeUserFromRoom,
  addMessageToRoom,
  getUpdatedRoomMembers,
} = require("./rooms.js");

const {
  makeCommonRoomName,
  removeFromQueue,
  findPeerForLoneSocket,
} = require("./queue.js");

app.use(express.json());

//middleware func
app.use("/register", register);
app.use("/login", login);
app.use("/app", chitApp); //protected route

prod(app); //run production middleware;

//log error if jwt private key not found in server environment variable
if (!config.get("jwtPrivateKey")) {
  console.error("FATAL ERROR: jwtPrivateKey not found.");
  process.exit(1);
}

//connect to db
mongoose
  .connect(config.get("db"), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  })
  .catch((err) => console.log("Failed to connect to MongoDB...", err))
  .then(() => console.log("Connected to MongoDB..."));

//listener for when client socket connects to server
io.on("connection", (socket) => {
  //declare useful variables
  let ip = socket.handshake.address;

  //listener for when client socket emits a join event after succesfully logging in...
  socket.on("join", async ({ userName, currentPath }) => {
    console.log("JOINED"); //DEV CONSOLE

    //get user document
    let user = await getUser(userName);

    //update total online for all connected sockets
    const onlineCount = io.engine.clientsCount;
    //emit latest online count to all connected client sockets when new client joins
    io.emit("online-count", onlineCount);

    console.log(onlineCount); //DEV CONSOLE

    if (currentPath === "/app" || currentPath === "/app/home") {
      //update user.room to #home/~ in db
      user = await updateUserRoom(userName, `#home/${userName}`);
      //join socket to home
      socket.join(`#home/${userName}`);
    }

    //join socket to #app/~ (helps identify and emit events to a particular socket)
    socket.join(`#app/${userName}`);

    //load users friend list (with most recent message) from db
    socket.emit("load-friends", await getFriendsAndMsgs(userName));

    //load users room list from db
    socket.emit("load-rooms", user.rooms);
  });

  //listener for when client renders Rooms view
  socket.on("/rooms", async (userName) => {
    //get user document
    let user = await getUser(userName);

    //check if user entered rooms screen from a private room
    if (user.currentRoom.slice(0, 6) === "#room/") {
      const roomMembers = await getUpdatedRoomMembers(
        user.currentRoom,
        user.name
      );

      //emit room members with updated online statuses to all clients in previous private room
      io.in(user.currentRoom).emit("load-room-members", roomMembers);
      //reload client's rooms in case client was deleted from private room
      socket.emit("load-rooms", user.rooms);
    }

    //check if user entered rooms screen from random chat
    else if (user.currentRoom.slice(0, 6) === "#chat/") {
      io.in(user.currentRoom).emit("message", {
        user: "admin",
        text: `${user.name} has left the chat...`,
      });

      io.in(user.currentRoom).emit("message", {
        user: "",
        text: "you may return home or skip to find another human",
      });
    }

    //leave current room
    socket.leave(user.currentRoom);
    //update user.room
    user = await updateUserRoom(user.name, `#rooms/${user.name}`);
    //join socket to rooms screen
    socket.join(`#rooms/${user.name}`);
  });

  //listener for when client renders Chat view with chatState = "private-room"
  socket.on("/private-room", async ({ userName, creator, roomName }) => {
    //get user document
    let user = await getUser(userName);

    //construct full name of room as used in database
    const fullRoomName = `#room/${creator}/${roomName}`;

    //if client tried to enter room that does not exist, exit function
    if (!user.rooms.includes(fullRoomName)) {
      //return client to Rooms view
      socket.emit("return-to-rooms");
      return;
    }

    //get room document
    let room = await getRoom(fullRoomName);

    //check if user entered private room screen from another private room
    if (user.currentRoom.slice(0, 6) === "#room/") {
      const roomMembers = await getUpdatedRoomMembers(
        user.currentRoom,
        user.name
      );

      //emit room members with updated online statuses to all clients in previous room
      io.in(user.currentRoom).emit("load-room-members", roomMembers);
    }

    //check if user entered private room screen from random chat
    else if (user.currentRoom.slice(0, 6) === "#chat/") {
      io.in(user.currentRoom).emit("message", {
        user: "admin",
        text: `${user.name} has left the chat...`,
      });

      io.in(user.currentRoom).emit("message", {
        user: "",
        text: "you may return home or skip to find another human",
      });
    }

    //if user entered a private room that exists in database...
    if (room) {
      //update users current room
      user = await updateUserRoom(user.name, room.name);

      // join client socket to private room
      socket.join(room.name);

      //emit topBar details to client
      socket.emit("topBarText", {
        creator: room.creator,
        roomName,
      });

      //get array of room members with updated online statuses
      const roomMembers = await getUpdatedRoomMembers(user.currentRoom, "");
      //emit update list of room members to all clients in room
      io.in(room.name).emit("load-room-members", roomMembers);

      //clear progress message
      socket.emit("clear-messages");

      //send stored messages to client
      socket.emit("load-prev-messages", room.messages);

      if (room.creator === user.name) {
        //determine which friends of room creator may be added to the room
        let addableFriends = user.friends.filter(
          (friend) => !room.users.includes(friend)
        );

        //load list of addable friends in to creator client
        io.in(`#app/${user.name}`).emit("load-addable-friends", addableFriends);
      }

      if (
        !room.messages.some(
          (message) =>
            message.text ===
            (room.creator === user.name
              ? `the almighty creator, ${user.name} has entered for the first time!`
              : `the honorable guest, ${user.name} has entered for the first time!`)
        )
      )
        io.in(user.currentRoom).emit("message", {
          user: "admin",
          text:
            room.creator === user.name
              ? `the almighty creator, ${user.name} has entered for the first time!`
              : `the honorable guest, ${user.name} has entered for the first time!`,
        });
    }
  });

  //listener for client renders Home view
  socket.on("/home", async (userName) => {
    //get user document
    let user = await getUser(userName);

    //load latest stats into client
    socket.emit("load-stats", {
      usersMet: user.usersMet.length,
      messagesSent: user.messagesSent,
    });

    //if user entered home screen from private room do this
    if (user.currentRoom.slice(0, 6) === "#room/") {
      const roomMembers = await getUpdatedRoomMembers(
        user.currentRoom,
        user.name
      );

      //emit room members with updated online statuses to all clients in previous room
      io.in(user.currentRoom).emit("load-room-members", roomMembers);
    }

    //if user was previously connected to another peer in random chat do this
    else if (user.currentRoom.slice(0, 6) === "#chat/") {
      io.in(user.currentRoom).emit("message", {
        user: "admin",
        text: `${user.name} has left the chat and returned home...`,
      });
      io.in(user.currentRoom).emit("message", {
        user: "",
        text: "you may return home or skip to find another human",
      });
    } else removeFromQueue(socket.userName); //remove socket from queue if it returned home from queue

    //leave current room
    socket.leave(user.currentRoom);

    //update user.room
    user = await updateUserRoom(user.name, `#home/${user.name}`);
    //join socket to home
    socket.join(`#home/${user.name}`);
  });

  //listener for when client renders Chat view with chatState = "random-chat-start"
  socket.on("/random-chat", async (userName) => {
    //get user document
    let user = await getUser(userName);

    //add userName property to socket object for identification
    socket.userName = userName;

    //check if user entered rooms screen from a private room
    if (user.currentRoom.slice(0, 6) === "#room/") {
      const roomMembers = await getUpdatedRoomMembers(
        user.currentRoom,
        userName
      );
      //emit room members with updated online statuses to all clients in previous room
      io.in(user.currentRoom).emit("load-room-members", roomMembers);
    }

    //if user was previously connected to another peer in random chat do this
    else if (user.currentRoom.slice(0, 6) === "#chat/") {
      io.in(user.currentRoom).emit("message", {
        user: "admin",
        text: `${user.name} has left the chat...`,
      });

      io.in(user.currentRoom).emit("message", {
        user: "",
        text: "you may return home or skip to find another human",
      });
    }

    //leave current room
    socket.leave(user.currentRoom);

    //update user.room
    user = await updateUserRoom(user.name, `#queue/${user.name}`);
    //join socket to #queue/~
    socket.join(`#queue/${user.name}`);

    //emit progress message
    socket.emit("message", {
      user: "",
      text: `searching for the perfect human...`,
    });

    //match socket with another socket from queue
    setTimeout(async () => {
      await findPeerForLoneSocket(socket);
    }, 1500);
  });

  //listener for when client renders Friends view
  socket.on("/friends", async (userName) => {
    //get User document
    let user = await getUser(userName);

    //check if user entered friends screen from a private room
    if (user.currentRoom.slice(0, 6) === "#room/") {
      const roomMembers = await getUpdatedRoomMembers(
        user.currentRoom,
        userName
      );

      //emit room members with updated online statuses to all clients in room
      io.in(user.currentRoom).emit("load-room-members", roomMembers);
    }

    //check if user entered friends screen from a random chat
    else if (user.currentRoom.slice(0, 6) === "#chat/") {
      io.in(user.currentRoom).emit("message", {
        user: "admin",
        text: `${user.name} has left the chat...`,
      });

      io.in(user.currentRoom).emit("message", {
        user: "",
        text: "you may return home or skip to find another human",
      });
    }

    //leave current room
    socket.leave(user.currentRoom);
    //update user.room
    user = await updateUserRoom(user.name, `#friends/${user.name}`);

    //join socket to friends screen
    socket.join(`#friends/${userName}`);

    //load array of friends with most recent messages
    socket.emit("load-friends", await getFriendsAndMsgs(user.name));
  });

  //listener for when client renders Chat view with chatState = "private-chat"
  socket.on("/private-chat", async ({ userName, friend }) => {
    let user = await getUser(userName);

    //if friend from url is not users friend, exit function
    if (!user.friends.includes(friend)) {
      //return client to Friends view
      socket.emit("return-to-friends");
      return;
    }

    //check if user entered rooms screen from a private room
    if (user.currentRoom.slice(0, 6) === "#room/") {
      const roomMembers = await getUpdatedRoomMembers(
        user.currentRoom,
        userName
      );

      //emit room members with updated online statuses to all clients in previous room
      io.in(user.currentRoom).emit("load-room-members", roomMembers);
    } else if (user.currentRoom.slice(0, 6) === "#chat/") {
      io.in(user.currentRoom).emit("message", {
        user: "admin",
        text: `${user.name} has left the chat...`,
      });

      io.in(user.currentRoom).emit("message", {
        user: "",
        text: "you may return home or skip to find another human",
      });
    }

    //leave current room
    socket.leave(user.currentRoom);

    //combine names to recreate db chat room name
    const roomName = makeCommonRoomName(userName, friend);

    //get room document
    const room = await getRoom(roomName);

    //update user.room
    user = await updateUserRoom(userName, `dm${roomName}`);

    //update room.users
    await addUserToRoom(roomName, user.name);

    //join socket to room prefixed with 'dm' to differentiate it from random chat room names
    socket.join(`dm${roomName}`);

    //load room name into client's infobar
    socket.emit("topBarText", { creator: "", roomName: friend });

    //load prev messages
    socket.emit("load-prev-messages", room.messages);
  });

  //listener for when user tries to befriend someone by saying #iloveyou
  socket.on("#iloveyou", async ({ userName, lastMessage }) => {
    //get user document
    let user = await getUser(userName);
    //get peer name from room name
    let peerName = getPeerFromRoom(user.currentRoom, user.name);

    //emit #iloveyou message to room
    io.in(user.currentRoom).emit("message", {
      user: `${user.name}`,
      text: `#iloveyou`,
    });

    //update home screen messagesSent stat for user
    await incrementMessagesSent(user.name);

    //if #iloveyou was said immediately after peer said it, and they are not already friends, form the union and pronounce them friends
    if (
      lastMessage.text === "say it back right now to form a true friendship" &&
      lastMessage.user === "admin" &&
      !user.friends.includes(peerName)
    ) {
      //pronounce them friend and friend
      io.in(user.currentRoom).emit("message", {
        user: "admin",
        text: `i hereby pronounce you friend and friend!`,
      });

      //update friends list in database for both users
      user = await addNewFriend(userName, peerName);
      peer = await addNewFriend(peerName, userName);

      //load new list of friends with last message for user
      socket.emit("load-friends", await getFriendsAndMsgs(user.name));
      //load new list of friends with last message for peer
      io.in(`#app/${peer.name}`).emit(
        "load-friends",
        await getFriendsAndMsgs(peer.name)
      );
    }

    //if they are already friends but still used the #ily commands, emit a silly admin message
    else if (user.friends.includes(peerName)) {
      //hint message to peer
      io.in(user.currentRoom).emit("message", {
        user: "admin",
        text: `you are both already friends, so that was cute`,
      });
    } else {
      //if this is first user to say #iloveyou and extend an invitation to be friends
      //emit hint message to peer
      socket.broadcast.to(user.currentRoom).emit("message", {
        user: "admin",
        text: `say it back right now to form a true friendship`,
      });
    }
  });

  //listener for when user skips peer in random chat using button/command
  socket.on("#skip", async (userName) => {
    //add userName property to socket object for identification
    socket.userName = userName;

    //get user document
    let user = await getUser(userName);

    //emit error message if #skip command is used outside Chat view with chatState = "random-chat-start"
    if (
      user.currentRoom === `#queue/${user.name}` ||
      user.currentRoom.slice(0, 6) === "#room/"
    ) {
      socket.emit("message", {
        user: "",
        text: `invalid command | #skip only works when you are already connected to a human.`,
      });
    } else {
      //if #skip is used in random chat...
      //let peer know that user left the chat
      io.in(user.currentRoom).emit("message", {
        user: "admin",
        text: `${user.name} has left the chat...`,
      });

      io.in(user.currentRoom).emit("message", {
        user: "",
        text: "you may return home or skip to find another human",
      });

      //remove socket from current room
      socket.leave(user.currentRoom);
      //remove user from array of users in room document
      await removeUserFromRoom(user.currentRoom, user.name);
      //update user.room
      user = await updateUserRoom(user.name, `#queue/${user.name}`);

      socket.join(`#queue/${user.name}`);

      socket.emit("clear-messages");

      socket.emit("message", {
        user: "",
        text: `searching for the perfect human...`,
      });

      //match socket with another socket from queue
      setTimeout(async () => {
        await findPeerForLoneSocket(socket);
      }, 1500);
    }
  });

  //listener for when user tries to create a new room
  socket.on("#room/new", async ({ userName, newRoom }) => {
    //generate roomName for database
    const fullRoomName = `#room/${userName}/${newRoom}`;

    //define accepted room name syntax in regex
    const messageREGEX = /(^[ a-z0-9]{2,100}$)/;
    //only create new room if it has a valid name
    if (messageREGEX.test(newRoom)) {
      //create private room if it doesn't already exist
      let room = await getRoom(fullRoomName);
      if (!room) room = await addRoom(fullRoomName, userName);

      // add room to user.rooms
      const user = await addRoomToUser(userName, fullRoomName);

      // update room.users
      room = await addUserToRoom(fullRoomName, user.name);

      //load room into clients Rooms view
      socket.emit("load-rooms", user.rooms);
    }
  });

  //listener for when creator of private room tries to add a friend to room
  socket.on("add-room-member", async ({ newMember, creator, roomName }) => {
    //get room document
    const fullRoomName = `#room/${creator}/${roomName}`;

    const room = await addUserToRoom(fullRoomName, newMember);

    //get room members with updated online statuses
    const roomMembers = await getUpdatedRoomMembers(room.name, "");
    // add room to user.rooms for new room member
    const user = await addRoomToUser(newMember, fullRoomName);

    //load room into newMember's client
    io.in(`#app/${newMember}`).emit("load-rooms", user.rooms);

    //emit room members with updated online statuses to all clients in room
    io.in(room.name).emit("load-room-members", roomMembers);

    //determine updated addable friends of creator
    const creatorUser = await getUser(creator);
    const addableFriends = creatorUser.friends.filter(
      (friend) => !room.users.includes(friend)
    );

    //emit updated addable friends to creator client
    io.in(`#app/${creator}`).emit("load-addable-friends", addableFriends);

    //emit action message to all clients in room
    io.in(fullRoomName).emit("message", {
      user: "admin",
      text: `the almighty creator ${creator} added ${newMember} to the room.`,
    });
  });

  //listener for when creator of private room tries to removed a friend to room
  socket.on(
    "remove-room-member",
    async ({ removedMember, creator, roomName }) => {
      //get room document
      const fullRoomName = `#room/${creator}/${roomName}`;
      const room = await removeUserFromRoom(fullRoomName, removedMember);

      //get room members with updated online statuses
      const roomMembers = await getUpdatedRoomMembers(room.name, "");

      // remove room from user.rooms for removed member
      const removedUser = await removeRoomFromUser(removedMember, fullRoomName);

      //remove room from removedMember's client
      io.in(`#app/${removedMember}`).emit("load-rooms", removedUser.rooms);

      //return removedMember client to /app/rooms if user was online in room when removed
      if (removedUser.currentRoom === fullRoomName)
        io.in(`#app/${removedMember}`).emit("return-to-rooms", removedMember);

      //emit updated room members with online statuses to all clients in room
      io.in(room.name).emit("load-room-members", roomMembers);

      //emit action message to all clients in room
      io.in(fullRoomName).emit("message", {
        user: "admin",
        text: `the almighty creator ${creator} removed ${removedMember} from the room.`,
      });

      //determine updated addable friends of creator
      const creatorUser = await getUser(creator);
      const addableFriends = creatorUser.friends.filter(
        (friend) => !room.users.includes(friend)
      );

      //emit updated addable friends to creator client
      io.in(`#app/${creator}`).emit("load-addable-friends", addableFriends);
    }
  );

  //listener for when #destroy is used to destroy a private room or a friendship
  socket.on("#destroy", async ({ userName }) => {
    let user = await getUser(userName);

    //if #destroy was used to destroy a private room
    if (user.currentRoom.slice(0, 6) === "#room/") {
      //get room document
      let room = await getRoom(user.currentRoom);
      //if command was sent by room's creator
      if (room.creator === user.name) {
        //remove room from list of rooms in user document

        room.users.forEach(async (userName) => {
          await removeRoomFromUser(userName, room.name);
        });

        //remove private room from database
        await deleteRoom(room.name);
        //emit event to change path of all clients in private room to /app/rooms
        io.in(room.name).emit("return-to-rooms", userName);
      } else {
        //emit error message
        socket.emit("message", {
          user: "",
          text: `you did not create this room, thus you do not possess the power to destroy it.`,
        });
      }
    } else {
      //if #destroy was used to destroy a friendship
      console.log("about to destroy friendship", user.currentRoom);
      //get friend name from room name
      const friend = getPeerFromRoom(user.currentRoom, user.name);

      if (user.friends.includes(friend)) {
        //remove friend from both users document
        user = await removeFriend(user.name, friend);
        const peer = await removeFriend(friend, user.name);

        //reload users friend list from db into both clients
        io.in(`#app/${user.name}`).emit(
          "load-friends",
          await getFriendsAndMsgs(user.name)
        );
        io.in(`#app/${peer.name}`).emit(
          "load-friends",
          await getFriendsAndMsgs(peer.name)
        );

        //emit command to room to mark the moment of destruction
        io.in(user.currentRoom).emit("message", {
          user: user.name,
          text: "#destroy",
        });

        //emit admin message
        io.in(user.currentRoom).emit("message", {
          user: "admin",
          text: `${user.name} destroyed the friendship.`,
        });
      } else {
        //emit error message
        socket.emit("message", {
          user: "",
          text: `you cannot destroy a friendship that does not exist.`,
        });
      }
    }
  });

  //listener to save messages into respective room document
  socket.on("update-messages", async ({ message, userName }) => {
    try {
      //get user document
      const user = await getUser(userName);
      //get room document
      let room = await getRoom(user.currentRoom);

      //check if room exists, client is not in queue, and event is emitted by the client who is the sender of that message
      if (
        room &&
        user.currentRoom !== `#queue/${user.name}` &&
        user.name === message.user &&
        message.user !== ""
      )
        //save message in database
        room = await addMessageToRoom(user.currentRoom, message);

      //same as above except first client in room.users gets to save all admin messages
      if (
        room &&
        user.currentRoom !== `#queue/${user.name}` &&
        message.user === "admin" &&
        user.name === room.users[0]
      )
        //save message in database
        room = await addMessageToRoom(user.currentRoom, message);
    } catch (err) {
      console.log("Failed to save message to database: ", err);
    }
  });

  //listener to handle messages sent by a client
  socket.on("sendMessage", async ({ message: text, userName, lastMessage }) => {
    //get user document
    const user = await getUser(userName);
    if (user) {
      //if user exists...

      //define accepted message syntax in regex
      const messageREGEX = /(^[ a-z0-9]{1,100}$)/;

      if (messageREGEX.test(text)) {
        //if message passes regex pattern test...
        io.in(user.currentRoom).emit("message", { user: user.name, text });

        //update home screen stats for user
        await incrementMessagesSent(user.name);
      } else if (text === "#news") {
        //if user requests random news article using #news command...
        //api url
        const url =
          "http://newsapi.org/v2/top-headlines?" +
          "country=us&" +
          "apiKey=7497229e6962478397096e360ead41e2";

        (async () => {
          try {
            //send apit get request
            const response = await got(url);
            //parse response body
            const newsArticles = JSON.parse(response.body).articles;

            //pick a random news article
            const randomNewsArticle =
              newsArticles[Math.floor(Math.random() * newsArticles.length)];

            //emit news article to clients
            text = `#news: ${randomNewsArticle.description.toLowerCase()}`;
            const link = randomNewsArticle.url;
            io.in(user.currentRoom).emit("message", {
              user: user.name,
              text,
              link,
            });

            //update home screen stats for user
            await incrementMessagesSent(user.name);
            // => '<!doctype html> ...'
          } catch (error) {
            text = "i tried to get a random news article but failed.";
            io.in(user.currentRoom).emit("message", { user: user.name, text });
            // => 'Internal server error ...'
          }
        })();
      } else {
        text = "i apologize for trying to break the rules.";
        io.in(user.currentRoom).emit("message", { user: user.name, text });
        await incrementMessagesSent(user.name);
        //Need to kick user out as well. INCOMPLETE
      } //to do something after the message is sent

      //if client does not say #iloveyou immediately after peer says it...
      lastMessage.text === "say it back right now to form a true friendship" &&
      lastMessage.user === "admin"
        ? io.in(user.currentRoom).emit("message", {
            user: "admin",
            text: `perhaps this friendship will be forged another time.`,
          })
        : null;
    }
  });

  socket.on("disconnect", async (userName) => {
    try {
      console.log(userName);
      const user = await updateUserRoom(userName, "offline");
      console.log(user);
      //update total online for all connected sockets
      const onlineCount = io.engine.clientsCount;
      //emit latest online count to all connected client sockets when new client joins
      io.emit("online-count", onlineCount);

      //check if user entered rooms screen from a private room
      if (user.currentRoom.slice(0, 6) === "#room/") {
        const roomMembers = await getUpdatedRoomMembers(
          user.currentRoom,
          user.name
        );

        //emit room members with updated online statuses to all clients in previous private room
        io.in(user.currentRoom).emit("load-room-members", roomMembers);
        //reload client's rooms in case client was deleted from private room
        socket.emit("load-rooms", user.rooms);
      }

      //check if user entered rooms screen from random chat
      else if (user.currentRoom.slice(0, 6) === "#chat/") {
        io.in(user.currentRoom).emit("message", {
          user: "admin",
          text: `${user.name} has left the website...`,
        });

        io.in(user.currentRoom).emit("message", {
          user: "",
          text: "you may return home or skip to find another human",
        });
      }
    } catch {
      return Error("Unexpected error during disconnect.");
    }
  });
});

server.listen(PORT, () => console.log(`Server has started on port ${PORT}`));
