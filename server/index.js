const express = require("express");
const path = require("path");
const socketio = require("socket.io");
const mongoose = require("mongoose");
const config = require("config");
//Why use socket.io?
//HTTP requests are slow. To do real time stuff, it's better to use sockets.
const http = require("http");

const PORT = process.env.PORT || 5000;

const register = require("./routes/register");
const login = require("./routes/login");
const chat = require("./routes/chat");

const app = express();
const server = http.createServer(app);
const io = socketio(server); //now we have an instance of the socket.io server can do a lot of stuff
const got = require("got");

const { getUser, updateUserRoom, updateSocketId } = require("./users.js");

const {
  addRoom,
  deleteRoom,
  getRoom,
  addUserToRoom,
  removeUserFromRoom,
  addMessageToRoom,
} = require("./rooms.js");

const {
  removeFromQueue,
  getSocket,
  FindPeerForLoneSocket,
} = require("./queue.js");

app.use(express.json());
// Serve the static files from the React app
// app.use(express.static(path.join(__dirname, "/../client/")));
//middleware func
app.use("/register", register);
app.use("/login", login);
app.use("/chat", chat);

//connect to db

if (!config.get("jwtPrivateKey")) {
  console.error("FATAL ERROR: jwtPrivateKey not found.");
  process.exit(1);
}

mongoose
  .connect("mongodb://localhost:27017/chit", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  }) //connects to database
  .catch((err) => console.log("Failed to connect to MongoDB...", err))
  .then(() => console.log("Connected to MongoDB..."));

// app.get("/", (req, res) => {
//   res.sendFile(path.join(__dirname + "/../client/public/index.html"));
// });

//The disconnect function inside of the io.on() because we are managing that particular socket that was connected.
io.on("connection", (socket) => {
  //declare useful variables
  let ip = socket.handshake.address;
  console.log(ip);

  // when a new socket joins do this...
  socket.on("join", async (userName) => {
    console.log("JOINED");
    let user = await updateSocketId(userName, socket.id);
    const homeRoom = `#home/${userName}`;

    //join socket to home room
    socket.join(homeRoom);

    //get home room if it already exists
    const existingHomeRoom = await getRoom(homeRoom);

    //add user's #home to Rooms if it doesnt exist
    if (!existingHomeRoom) {
      await addRoom(homeRoom, userName);

      //add user to room.users
      await addUserToRoom(homeRoom, user);

      //emit welcome messages
      socket.emit("message", {
        user: "admin",
        text: `hi ${userName}, welcome to chit. this is your home screen`,
      });

      setTimeout(() => {
        socket.emit("message", {
          user: "admin",
          text: `in the meantime, figure out the features and rules of this room by talking to yourself!`,
        });
      }, 1000);

      setTimeout(() => {
        socket.emit("message", {
          user: "admin",
          text: `here's a hint: type '#news' and hit send ;)`,
        });
      }, 2000);
    } else {
      //send stored messages to client
      const oldMessages = existingHomeRoom.messages;
      socket.emit("load-prev-messages", oldMessages);
    }

    //?
  });

  socket.on("#chat", async () => {
    let user = await getUser(socket.id);

    //#chat command only works when user is in the 'home' screen
    if (user.room !== `#home/${user.name}`) {
      socket.emit("message", {
        user: "",
        text: `invalid command | if you were trying to skip this human, try #skip.`,
      });
    } else {
      // clear home messages
      socket.emit("clear-messages");

      //leave #home
      socket.leave(`#home/${user.name}`);
      //update user.room to queue
      user = await updateUserRoom(user.name, `#queue/${user.name}`);
      //update room of socket
      socket.join(`#queue/${user.name}`);

      //emit matching in progress message
      socket.emit("message", {
        user: "",
        text: `you will soon be matched with a human...`,
      });

      //match socket with another socket from queue
      setTimeout(async () => {
        await FindPeerForLoneSocket(socket);
      }, 1500);
    }
  });

  socket.on("#skip", async () => {
    let user = await getUser(socket.id);

    //#skip command only works when user is connected to 1-on-1 peer
    if (
      user.room === `#home/${user.name}` ||
      user.room === `#queue/${user.name}` ||
      user.room.slice(0, 6) === "#room/"
    ) {
      socket.emit("message", {
        user: "",
        text: `invalid command | #skip only works when you are already connected to a human. try #chat if you are ready to connect to a human.`,
      });
    } else {
      io.in(user.room).emit("message", {
        user: "admin",
        text: `${user.name} has left the chat...`,
      });

      io.in(user.room).emit("message", {
        user: "",
        text: `use #home to return home, or #skip to find another human.`,
      });

      //remove socket from current room
      socket.leave(user.room);
      //update users array in room
      await removeUserFromRoom(user.room, user);
      //update user.room
      user = await updateUserRoom(user.name, `#queue/${user.name}`);

      socket.join(`#queue/${user.name}`);

      socket.emit("clear-messages");

      socket.emit("message", {
        user: "",
        text: `you will soon be matched with another human...`,
      });

      //match socket with another socket from queue
      setTimeout(async () => {
        await FindPeerForLoneSocket(socket);
      }, 1500);
    }
  });

  socket.on("#home", async () => {
    let user = await getUser(socket.id);

    //#home command only works when user is connected to another user or waiting in queue or in a private room
    if (user.room === `#home/${user.name}`) {
      socket.emit("message", {
        user: "",
        text: `invalid command | you are already home. try #home when you are waiting to connect or already connected to another human. `,
      });
    } else {
      //if user is connected to another peer in random chat, do this
      if (
        user.room !== `#queue/${user.name}` &&
        user.room.slice(0, 6) !== "#room/"
      ) {
        io.in(user.room).emit("message", {
          user: "admin",
          text: `${user.name} has left the chat and returned home...`,
        });
        io.in(user.room).emit("message", {
          user: "",
          text: `use #home to return home, or #skip to find another human.`,
        });
      }

      //if user is in a private room do this
      else if (user.room.slice(0, 6) === "#room/") {
        io.in(user.room).emit("message", {
          user: "admin",
          text: `${user.name} has left the chat...`,
        });
      } else removeFromQueue(socket.id); //remove socket from queue if its in queue

      //leave current room
      socket.leave(user.room);
      //update users array in room
      await removeUserFromRoom(user.room, user);
      //update user.room
      user = await updateUserRoom(user.name, `#home/${user.name}`);
      //join #home
      socket.join(`#home/${user.name}`);

      socket.emit("clear-messages");

      //send stored messages to client
      socket.emit("load-prev-messages", (await getRoom(user.room)).messages);

      //welcome back message
      socket.emit("message", {
        user: "admin",
        text: `welcome back home, ${user.name}!`,
      });
    }
  });

  socket.on("#room/new", async () => {
    const user = await getUser(socket.id);

    //generate secret room key that can be used to join the private room
    const roomKey = socket.id.slice(0, socket.id.length - 2);

    //check if you have already created a room

    //create private room if it doesn't already exist
    if (!(await getRoom(roomKey))) {
      await addRoom(`#room/${roomKey}`, user.name);

      socket.emit("message", {
        user: "admin",
        text: `a room has been created for you. you and upto 4 of your friends may join your room using the command #room/join/${roomKey}`,
      });

      setTimeout(() => {
        socket.emit("message", {
          user: "admin",
          text: `you may delete this room using the command #room/delete/${roomKey}`,
        });
      }, 500);
    } else {
      socket.emit("message", {
        user: "",
        text: `this room already exists. you may join your room using the command #room/join/${roomKey}`,
      });
    }
  });

  socket.on("#room/join", async (key) => {
    let user = await getUser(socket.id);

    //#room/join/ command only works when user is in the 'home' screen
    if (user.room !== `#home/${user.name}`) {
      socket.emit("message", {
        user: "",
        text: `invalid command | if you were trying to join a room, you must first return home.`,
      });
    } else {
      let room = await getRoom(`#room/${key}`);

      if (room) {
        if (user.name === room.creator || room.users.length < 6) {
          // clear home messages
          socket.emit("clear-messages");

          //leave #home
          socket.leave(`#home/${user.name}`);

          //update user.room
          user = await updateUserRoom(user.name, `#room/${key}`);

          // join #room/key
          socket.join(`#room/${key}`);
          // update room.users
          room = await addUserToRoom(`#room/${key}`, user);

          //emit matching in progress message
          socket.emit("message", {
            user: "",
            text: `you are entering a private room...`,
          });

          setTimeout(() => {
            socket.emit("clear-messages");

            //send stored messages to client
            socket.emit("load-prev-messages", room.messages);

            if (room.messages.length === room.users.length - 1) {
              io.in(user.room).emit("message", {
                user: "admin",
                text:
                  room.creator === user.name
                    ? `the almighty creator, ${user.name} has joined!`
                    : `the honorable guest, ${user.name} has joined!`,
              });
            } else {
              //send stored messages to client
              // socket.emit("load-prev-messages", room.messages);
              io.in(user.room).emit("message", {
                user: "admin",
                text:
                  room.creator === user.name
                    ? `the almighty creator, ${user.name} has returned!`
                    : `the honorable guest, ${user.name} has returned!`,
              });
            }
          }, 1500);
        }
      }
    }
  });

  socket.on("#room/delete", async (key) => {
    let user = await getUser(socket.id);

    //#room/delete/ command only works when user is in the 'home' screen
    if (user.room !== `#home/${user.name}`) {
      socket.emit("message", {
        user: "",
        text: `invalid command | if you were trying to delete a room, you must first return home.`,
      });
    } else {
      let room = await getRoom(`#room/${key}`);
      //might have to change this if condition as well
      if (room) {
        if (room.creator === user.name) {
          //kick all users out of that room and return them to their respective homes
          const users = (await getRoom(`#room/${key}`)).users;
          if (users) {
            users.forEach(async (user) => {
              //get socket using socket id
              const socket = getSocket(io, user.socketId);

              //leave private room
              socket.leave(user.room);
              //update user.room
              user = await updateUserRoom(user.name, `#home/${user.name}`);
              //join #home
              socket.join(`#home/${user.name}`);
              //clear messages
              socket.emit("clear-messages");

              //send stored messages to client
              socket.emit(
                "load-prev-messages",
                (await getRoom(user.room)).messages
              );

              //welcome message in #home
              socket.emit("message", {
                user: "admin",
                text: `welcome back home, ${user.name}!`,
              }); //WHY IS THIS ACTING WEIRD?

              socket.emit("message", {
                user: "admin",
                text: `the room you were in was destroyed by its creator ${room.creator}, but thankfully you made it back safely.`,
              });
            });
          }

          //remove private room from database
          deleteRoom(`#room/${key}`);

          socket.emit("message", {
            user: "admin",
            text: `you have destroyed your room and all its glorious history.`,
          });
        } else {
          socket.emit("message", {
            user: "",
            text: `you did not create this room, thus you do not possess the power to destroy it.`,
          });
        }
      } else {
        socket.emit("message", {
          user: "",
          text: `you cannot destroy something that does not exist.`,
        });
      }
    }
  });

  socket.on("update-messages", async (message) => {
    try {
      const user = await getUser(socket.id);
      const room = await getRoom(user.room);

      if (
        user.room !== `#queue/${user.name}` &&
        user.name === room.users[0].name &&
        message.user !== ""
      )
        await addMessageToRoom(user.room, message);
    } catch (err) {
      console.log("UNEXPECTED ERROR", err);
    }
  });

  //handling an event recieved by the backend from the frontend
  //'sendMessage' event is for user generated messages
  socket.on("sendMessage", async (text) => {
    const user = await getUser(socket.id);
    if (user) {
      const messageREGEX = /(^[ a-z0-9]{2,100}$)|(^<3$)/;
      if (messageREGEX.test(text)) {
        io.in(user.room).emit("message", { user: user.name, text });
      } else if (text === "#news") {
        const url =
          "http://newsapi.org/v2/top-headlines?" +
          "country=us&" +
          "apiKey=7497229e6962478397096e360ead41e2";

        (async () => {
          try {
            const response = await got(url);
            const newsArticles = JSON.parse(response.body).articles;

            const randomNewsArticle =
              newsArticles[Math.floor(Math.random() * newsArticles.length)];

            text = `#news: ${randomNewsArticle.description.toLowerCase()}`;
            const link = randomNewsArticle.url;
            io.in(user.room).emit("message", { user: user.name, text, link });
            // => '<!doctype html> ...'
          } catch (error) {
            text = "i tried to get a random news article but failed.";
            io.in(user.room).emit("message", { user: user.name, text });
            // => 'Internal server error ...'
          }
        })();
      } else {
        text = "i apologize for trying to break the rules.";
        io.in(user.room).emit("message", { user: user.name, text });
        //Need to kick user out as well. INCOMPLETE
      } //to do something after the message is sent
    }
  });

  socket.on("disconnect", async () => {
    try {
      const user = await getUser(socket.id);

      //get peer from room.users
      const room = await getRoom(user.room);
      const peerArray = room.users.filter((u) => u.name !== user.name);

      //if user was not in #home, remove him from room and alert peers and then add him to #home
      if (peerArray) {
        await removeUserFromRoom(room.name, user);

        io.in(user.room).emit("message", {
          user: "admin",
          text: `${user.name} has disconnected...`,
        });

        //send user back to #home
        await updateUserRoom(user.name, `#home/${user.name}`);
      }
    } catch {
      return Error("something went wrong");
    }
  });
});

server.listen(PORT, () => console.log(`Server has started on port ${PORT}`));
