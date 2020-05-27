const express = require("express");
const socketio = require("socket.io");
//Why use socket.io?
//HTTP requests are slow. To do real time stuff, it's better to use sockets.
const http = require("http");

const PORT = process.env.PORT || 5000;

const router = require("./router");

const app = express();
const server = http.createServer(app);
const io = socketio(server); //now we have an instance of the socket.io server can do a lot of stuff
const got = require("got");

const {
  addUser,
  addRoom,
  removeRoom,
  getRoom,
  enqueue,
  dequeue,
  queueIsEmpty,
  removeFromQueue,
  removeUser,
  getUser,
  updateRoom,
  getSocket,
  FindPeerForLoneSocket,
  addUserToRoom,
  removeUserFromRoom,
  addMessageToRoom,
} = require("./database.js");

//The disconnect function inside of the io.on() because we are managing that particular socket that was connected.
io.on("connection", (socket) => {
  //declare useful variables
  let ip = socket.handshake.address;
  console.log(ip);

  // when a new socket joins do this...
  socket.on("join", async (joinData, callback) => {
    let { error, user } = await addUser({
      id: socket.id,
      name: joinData.name,
      room: `#home/${joinData.name}`,
      password: "default",
    }); //addUser() returns either a error object or user object

    //a callback function can be passed in along with the data
    //this callback can be executed after some thing has been done with the data

    if (error) {
      console.log("Error", error, "User", joinData.name);
      return callback(error);
    }

    //add user's #home to Rooms
    if (!(await getRoom(`#home/${joinData.name}`)))
      await addRoom(`#home/${joinData.name}`, user.name);

    //add user to room.users
    await addUserToRoom(`#home/${joinData.name}`, user);

    //join socket to home room
    socket.join(user.room);

    socket.emit("message", {
      user: "admin",
      text: `hi ${user.name}, welcome to chit. this is your home screen`,
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
    //callback?
  });

  socket.on("#chat", async (callback) => {
    let user = await getUser(socket.id);
    callback();

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
      //update user.room
      user = await updateRoom(`#queue/${user.name}`, user.id);
      //update room of socket and user
      socket.join(`#queue/${user.name}`);

      //emit matching in progress message
      socket.emit("message", {
        user: "",
        text: `you will soon be matched with a human...`,
      });

      //match socket with another socket from queue
      setTimeout(async () => {
        await FindPeerForLoneSocket(io, socket);
      }, 1500);
    }
  });

  socket.on("#skip", async (callback) => {
    let user = await getUser(socket.id);

    //get peer from room.users
    const room = await getRoom(user.room);
    const peerArray = room.users.filter((u) => u.id !== user.id);
    const peer = peerArray[0];

    //#skip command only works when user is not in #home or #queue
    if (
      user.room === `#home/${user.name}` ||
      user.room === `#queue/${user.name}` ||
      user.room.slice(0, 6) === "#room/"
    ) {
      callback();
      socket.emit("message", {
        user: "",
        text: `invalid command | #skip only works when you are already connected to a human. try #chat if you are ready to connect to a human.`,
      });
    } else {
      callback();

      socket.emit("clear-messages");

      socket.broadcast.to(user.room).emit("message", {
        user: "admin",
        text: `${user.name} has left the chat...`,
      });

      socket.broadcast.to(user.room).emit("message", {
        user: "",
        text: `use #home to return home, or #skip to find another human.`,
      });

      //remove socket from current room
      socket.leave(user.room);
      //update user.room
      user = await updateRoom(`#queue/${user.name}`, user.id);
      //update room of socket and user
      socket.join(`#queue/${user.name}`);

      socket.emit("message", {
        user: "",
        text: `you skipped ${peer.name}. you will soon be matched with another human...`,
      });

      //match socket with another socket from queue
      setTimeout(async () => {
        await FindPeerForLoneSocket(io, socket);
      }, 1500);
    }
  });

  socket.on("#home", async (callback) => {
    let user = await getUser(socket.id);

    callback();

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
        socket.broadcast.to(user.room).emit("message", {
          user: "admin",
          text: `${user.name} has left the chat...`,
        });
        socket.broadcast.to(user.room).emit("message", {
          user: "",
          text: `use #home to return home, or #skip to find another human.`,
        });
      }

      //if user is in a private room do this
      if (user.room.slice(0, 6) === "#room/") {
        socket.broadcast.to(user.room).emit("message", {
          user: "admin",
          text: `${user.name} has left the chat...`,
        });

        console.log("USER ROOM ISSSSSSSS", user.room, user);
        try {
          await removeUserFromRoom(user.room, user);
        } catch (err) {
          console.log(err);
        }
      }

      //remove socket from queue if its in queue
      removeFromQueue(socket.id);
      //leave current room
      socket.leave(user.room);
      //update user.room
      user = await updateRoom(`#home/${user.name}`, user.id);
      //join #home
      socket.join(`#home/${user.name}`);

      socket.emit("clear-messages");

      //send stored messages to client
      socket.emit("load-prev-messages", (await getRoom(user.room)).messages);

      socket.emit("message", {
        user: "admin",
        text: `welcome back home, ${user.name}!`,
      });
    }
  });

  socket.on("#room/new", async (callback) => {
    const user = await getUser(socket.id);
    callback();

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

  socket.on("#room/join", async (key, callback) => {
    let user = await getUser(socket.id);
    callback();

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
          user = await updateRoom(`#room/${key}`, user.id);

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

  socket.on("#room/delete", async (key, callback) => {
    let user = await getUser(socket.id);
    callback();

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
              const socket = getSocket(io, user.id);

              //leave private room
              socket.leave(user.room);
              //update user.room
              user = await updateRoom(`#home/${user.name}`, user.id);
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
          removeRoom(`#room/${key}`);

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
    const user = await getUser(socket.id);
    const room = await getRoom(user.room);
    console.log("updating messages...", message);
    if (room) {
      room.users.length > 1 &&
      user.name === room.users[0].name &&
      message.user !== ("admin" || "")
        ? await addMessageToRoom(user.room, message)
        : null;

      user.name === room.users[0].name && message.user === "admin"
        ? await addMessageToRoom(user.room, message)
        : null;
    }
  });

  //handling an event recieved by the backend from the frontend
  //'sendMessage' event is for user generated messages
  socket.on("sendMessage", async (text, callback) => {
    const user = await getUser(socket.id);
    if (user) {
      console.log("UNO");
      const messageREGEX = /(^[ a-z0-9]{2,100}$)|(^<3$)/;
      if (messageREGEX.test(text)) {
        io.in(user.room).emit("message", { user: user.name, text });
        console.log("DOSO", user.room);
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
      }
      callback(); //to do something after the message is sent
    }
  });

  socket.on("disconnect", async () => {
    try {
      const user = await getUser(socket.id);

      //get peer from room.users
      const room = await getRoom(user.room);
      const peerArray = room.users.filter((u) => u.id !== user.id);
      const peer = peerArray[0];

      const peerSocket = getSocket(io, peer.id);

      //alert peer
      console.log("CHAT ENDING");

      io.in(user.room).emit("message", {
        user: "Admin",
        text: `${user.name} has left the chat...`,
      });

      if (peerSocket) {
        // peerSocket.emit("message", {
        //   user: "Admin",
        //   text: `${user.name} has left the chat`,
        // });

        //add peer back to the queue
        enqueue(peerSocket);
        peerSocket.emit("enqueued");
      }
      return await removeUser(socket.id);
    } catch {
      return Error("something went wrong");
    }
  });
});

app.use(router);

server.listen(PORT, () => console.log(`Server has started on port ${PORT}`));
