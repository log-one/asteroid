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

//The disconnect function inside of the io.on() because we are managing that particular socket that was connected.
io.on("connection", socket => {
  console.log("We have a new connection!!!");

  socket.on("disconnect", () => {
    console.log("User just left!!!");
  });
});

app.use(router);

server.listen(PORT, () => console.log(`Server has started on port ${PORT}`));
