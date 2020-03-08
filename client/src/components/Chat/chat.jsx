import React, { Component, useState, useEffect } from "react";
import queryString from "query-string";
import io from "socket.io-client";

import "./chat.css";

let socket;
//the location prop comes from React-Router
const Chat = ({ location }) => {
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const ENDPOINT = "localhost:5000";

  useEffect(() => {
    //location.search contains just the query part of the URL
    //queryString.parse() parses it into an object with the query string parameters and values as key-value pairs
    const { name, room } = queryString.parse(location.search);

    //create a socket object on the client side
    socket = io(ENDPOINT);
    //this socket object is connected to the socket object on the server side through the endpoint URL

    setName(name);
    setRoom(room);

    //socket.emit() allows us to emit an event to the server and have some data passed along with it
    //the server upon recognizing the emitted event can access the emitted data (if any) and do something
    //a callback function can be passed in the server as the second parameter of the event listener
    //we can define that callback function here to do something after the event has been emitted (ex: to do error handling)
    socket.emit("join", { name, room }, error => {
      alert(error.error);
    });

    //describe what needs to be done as the component unmounts
    return () => {
      socket.emit("disconnect");
      socket.off();
    };

    console.log(socket);
  }, [ENDPOINT, location.search]);

  return <h1>chat</h1>;
};

export default Chat;
