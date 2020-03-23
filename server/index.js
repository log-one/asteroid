const express = require("express");
const socketio = require("socket.io");
//Why use socket.io?
//HTTP requests are slow. To do real time stuff, it's better to use sockets.
const http = require("http");

const PORT = process.env.PORT || 5000;

const router = require("./router");

const app = express();
const server = http.createServer(app);
const io = socketio(server); //now we have a socket.io object that can do a lot of stuff

const { addUser, removeUser, getUser, getUsersInRoom } = require("./users.jsx");

//The disconnect function inside of the io.on() because we are managing that particular socket that was connected.
io.on("connection", socket => {
  socket.on("join", (joinData, callback) => {
    const { error, user } = addUser({
      id: socket.id,
      name: joinData.name,
      room: joinData.room
    }); //addUser() returns either a error object or user object

    //a callback function can be passed in along with the data
    //this callback can be executed after something has been done with the data
    if (error) {
      console.log("Error", error, "User", user);
      return callback(error);
    }

    //here we emit an event from the backend to the frontend
    socket.emit("message", {
      user: "Admin",
      text: `${user.name}, welcome to the room ${user.room}`
    });

    //socket.broadcast is going to send a message to everyone besides that specific user
    //again we emit an event from the backend to the frontend
    socket.broadcast
      .to(user.room)
      .emit("message", { user: "Admin", text: `${user.name} has joined!` });

    //socket.join() is a built in function that joins a user into a room
    socket.join(user.room);

    //send an object with data about the list of users online in the room
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsersInRoom(user.room)
    });

    //callback();
  });

  //handling an event recieved by the backend from the frontend
  //'sendMessage' event is for user generated messages
  socket.on("sendMessage", (text, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit("message", { user, text });
    callback(); //to do something after the message is sent
  });

  socket.on("disconnect", () => {
    //we remove our user right here so that the admin sends a welcome message when the user refreshes the page: console.log("User just left!!!");
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit("message", {
        user: "Admin",
        text: `${user.name} has left`
      });

      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsersInRoom(user.room)
      });
    }
  });
});

app.use(router);

server.listen(PORT, () => console.log(`Server has started on port ${PORT}`));
