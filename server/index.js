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

const { addUser, removeUser, getUser, getUsersInRoom } = require("./users.js");

//The disconnect function inside of the io.on() because we are managing that particular socket that was connected.
io.on("connection", (socket) => {
  let ip = socket.handshake.address;
  console.log(ip);
  socket.on("join", (joinData, callback) => {
    const { error, user } = addUser({
      id: socket.id,
      name: joinData.name,
      room: joinData.room,
    }); //addUser() returns either a error object or user object

    //a callback function can be passed in along with the data
    //this callback can be executed after something has been done with the data
    if (error) {
      console.log("Error", error, "User", user);
      return callback(error);
    }

    //socket.join() is a built in function that joins a user into a room
    socket.join(user.room);

    //send an object with data about the list of users online in the room
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    //here we emit an event from the backend to the frontend
    socket.emit("message", {
      user: "admin",
      text: `${user.name}, welcome to the room ${user.room}`,
    });

    //socket.broadcast is going to send a message to everyone besides that specific user
    //again we emit an event from the backend to the frontend
    socket.broadcast
      .to(user.room)
      .emit("message", { user: "admin", text: `${user.name} has joined!` });

    //callback();
  });

  //handling an event recieved by the backend from the frontend
  //'sendMessage' event is for user generated messages
  socket.on("sendMessage", (text, callback) => {
    const user = getUser(socket.id);
    if (user) {
      const messageREGEX = /(^[ a-z0-9]{2,100}$)|(^<3$)/;
      if (messageREGEX.test(text))
        io.to(user.room).emit("message", { user, text });
      else if (text === "#news") {
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
            io.to(user.room).emit("message", { user, text, link });
            // => '<!doctype html> ...'
          } catch (error) {
            text = "i tried to get a random news article but failed.";
            io.to(user.room).emit("message", { user, text });
            // => 'Internal server error ...'
          }
        })();
      } else {
        text = "i apologize for trying to break the rules.";
        io.to(user.room).emit("message", { user, text });
        //Need to kick user out as well. INCOMPLETE
      }
      callback(); //to do something after the message is sent
    }
  });

  socket.on("disconnect", () => {
    //we remove our user right here so that the admin sends a welcome message when the user refreshes the page: console.log("User just left!!!");
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit("message", {
        user: "Admin",
        text: `${user.name} has left`,
      });

      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

app.use(router);

server.listen(PORT, () => console.log(`Server has started on port ${PORT}`));
