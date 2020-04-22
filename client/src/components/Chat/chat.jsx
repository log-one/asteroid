import React, { useState, useEffect } from "react";
import queryString from "query-string";
import io from "socket.io-client";
import InfoBar from "../InfoBar/InfoBar";
import InputBar from "../InputBar/InputBar";
import Messages from "../Messages/Messages";
import SideBar from "../SideBar/SideBar";

import "./chat.css";

let socket;
//the location prop comes from React-Router in App.js
const Chat = ({ location }) => {
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [messages, setMessages] = useState([]); //array of all messages
  //above array of messages should be in a DB
  const [message, setMessage] = useState(""); // each message
  const [users, setUsers] = useState([]); //array of users in room
  const [sideBarOpen, setSideBarOpen] = useState(false);
  const [canSpeak, setCanSpeak] = useState({
    eligible: true,
    lastMessageNum: 0,
  });

  const ENDPOINT = "localhost:5000";

  console.log("Another State Declaration");

  useEffect(() => {
    console.log("JOIN (first) useEffect()");
    //location.search contains just the query part of the URL
    //queryString.parse() parses it into an object with the query string parameters and values as key-value pairs
    const { name, room } = queryString.parse(location.search);

    //create a socket object on the client side
    socket = io(ENDPOINT); //emits a 'connection' event to ENDPOINT along with 'socket' object?
    //this socket object is connected to the socket object on the server side through the endpoint URL

    setName(name.trim().toLowerCase());
    setRoom(room);

    //socket.emit() allows us to emit an event to the server and have some data passed along with it
    //the server upon recognizing the emitted event can access the emitted data (if any) and do something
    //a callback function can be passed in the server as the second parameter of the event listener
    //we can define that callback function here to do something after the event has been emitted (ex: to do error handling)
    socket.emit("join", { name, room }, (e) => {
      alert(e);
    });

    console.log("EMITTED JOIN (1st EFFECT");

    //describe what needs to be done as the component unmounts
    return () => {
      socket.emit("disconnect");
      socket.off();
    };

    //console.log(socket);
  }, [ENDPOINT, location.search]);

  //By the end of the execution of the first useEffect, a user would've been added to the Users[] in the backend and
  //a 'message' event would've been sent by {user: 'admin'}, welcoming the new user.

  //this useEffect() updates data about users in room and re-renders sidebar
  useEffect(() => {
    console.log("ROOMDATA (SECOND) useEffect()");
    socket.on("roomData", ({ users }) => {
      console.log("UPDATINGGGG USERS (2nd EFFECT", users);
      setUsers(users); //updates state of users with data recieved from getUsersInRoom() from server
      console.log("UPDATED USERS (2nd EFFECT", users);
    });

    return () => {
      socket.off("roomData");
    };
  }, [users]);

  //the next useEffect() handles the 'message' event and updates the Messages[] state of the Chat component
  useEffect(() => {
    console.log("MESSAGE (THIRD) useEffect()");
    socket.on("message", (message) => {
      console.log("UPDATINGGGGG MSGS");
      setMessages([...messages, message]); //this is adding every new message sent by admin or anyone else to our messages array
      console.log("UPDATED MSGS (3rd EFFECT");
      //convert later to promises or async await
    });

    //disable input if most recent message was sent by current user
    if (messages.length !== 0)
      if (messages[messages.length - 1].user.name === name) {
        setCanSpeak({
          eligible: false,
          lastMessageNum: messages.length,
        }); //when user speaks, note what number his message is in the list of all messages
      }
    //turn-based conversation logic
    let messagesSince;
    //after new message from another user is rendered calculate how many messages have passed since the current user last spoke
    messagesSince = messages.length - canSpeak.lastMessageNum;
    //decide when to allow users to speak
    if (users.length === 2 && messagesSince === 1)
      setCanSpeak({
        eligible: true,
        lastMessageNum: canSpeak.lastMessageNum,
      });
    if (users.length > 2 && messagesSince === 2)
      setCanSpeak({
        eligible: true,
        lastMessageNum: canSpeak.lastMessageNum,
      });

    return () => {
      socket.off("message");
    };
  }, [messages]);

  //function to toggle sidebar
  const toggleSideBar = (event) => {
    event.preventDefault();
    setSideBarOpen(!sideBarOpen);
  };

  //create a function to send messages (once a message is typed and entered in the chatbox)
  const sendMessage = (event) => {
    event.preventDefault(); //clicking a button or onKeyPress refreshes the whole page. This prevents that default behaviour from happening

    if (message) {
      socket.emit("sendMessage", message, () => setMessage("")); //the callback function resets the message state to an empty string
    }
  };

  //and then add a bunch of components/JSX below to render a proper looking Chat component
  return (
    <div className="outerContainer">
      {console.log("RENDER COMP (FOURTH) func")}
      <div className="container">
        <SideBar
          sideBarOpen={sideBarOpen}
          toggleSideBar={toggleSideBar}
          users={users}
          room={room}
        />

        <InfoBar
          room={room}
          name={name}
          users={users}
          toggleSideBar={toggleSideBar}
          setCanSpeak={setCanSpeak}
          canSpeak={canSpeak}
          sideBarOpen={sideBarOpen}
          messages={messages}
        />

        <Messages messages={messages} name={name} />
        <InputBar
          pattern={"(^[ a-z0-9]{2,100}$)|(^<3$)|(^#news$)"}
          message={message}
          name={name}
          setMessage={setMessage}
          sendMessage={sendMessage}
          canSpeak={canSpeak}
        />
      </div>
    </div>
  );
};

export default Chat;
