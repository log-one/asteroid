import React, { useState, useEffect } from "react";
import queryString from "query-string";
import io from "socket.io-client";
import InfoBar from "../InfoBar/InfoBar";
import InputBar from "../InputBar/InputBar";
import Messages from "../Messages/Messages";
import SideBar from "../SideBar/SideBar";
import jwtDecode from "jwt-decode";

import "./Chat.css";

let socket;
//the location prop comes from React-Router in App.js
const Chat = () => {
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [messages, setMessages] = useState([]); //array of all messages
  //above array of messages should be in a DB
  const [message, setMessage] = useState(""); // each message
  // const [enqueued, setEnqueued] = useState(false);
  const [sideBarOpen, setSideBarOpen] = useState(false);
  const [canSpeak, setCanSpeak] = useState(true);

  const ENDPOINT = "localhost:5000";

  useEffect(() => {
    //create a socket object on the client side
    socket = io(ENDPOINT); //emits a 'connection' event to ENDPOINT along with 'socket' object?
    //this socket object is connected to the socket object on the server side through the endpoint URL
  }, []);

  //the next useEffect() adds listeners to handle message updating, clearing and loading
  useEffect(() => {
    socket.on("message", (message) => {
      socket.emit("update-messages", message);
      console.log("ADDING NEW MESSAGE");
      setMessages((messages) => [...messages, message]); //this is adding every new message sent by admin or anyone else to our messages array
    });

    //event listener to clear messages
    socket.on("clear-messages", () => {
      console.log("CLEARING MESSAGES");
      setMessages([]);
    });

    //event listener to load previous messages
    socket.on("load-prev-messages", (oldMessages) => {
      console.log("LOADING PREV MESSAGES");
      setMessages(oldMessages);
    });

    // //make user eligible to speak if most recent message was sent by peer
    // if (messages.length > 0)
    //   if (messages[messages.length - 1].user === name) setCanSpeak(false);
    //   else setCanSpeak(true);

    console.log("Cleaned up and added new listeners", messages);

    return () => {
      socket.off("message");
      socket.off("clear-messages");
      socket.off("load-prev-messages");
    };
    // eslint-disable-next-line
  }, [messages]);

  useEffect(() => {
    const jwt = localStorage.getItem("token");
    const { name: userName } = jwtDecode(jwt);

    //if payload is successfully extracted from jwt, emit "join" event
    if (userName) {
      setName(userName.trim().toLowerCase());
      socket.emit("join", userName);
    }

    //describe what needs to be done as the component unmounts
    return () => {
      socket.emit("disconnect");
      socket.off();
    };
  }, [ENDPOINT]);

  //function to toggle sidebar
  const toggleSideBar = (event) => {
    event.preventDefault();
    setSideBarOpen(!sideBarOpen);
  };

  //create a function to send messages (once a message is typed and entered in the chatbox)
  const sendMessage = (event) => {
    event.preventDefault(); //clicking a button or onKeyPress refreshes the whole page. This prevents that default behaviour from happening

    if (message) {
      if (message === "#chat") {
        socket.emit("#chat");
        setMessage("");
      } else if (message === "#home") {
        socket.emit("#home");
        setMessage("");
      } else if (message === "#skip") {
        socket.emit("#skip");
        setMessage("");
      } else if (message === "#room/new") {
        socket.emit("#room/new");
        setMessage("");
      } else if (message.slice(0, 11) === "#room/join/") {
        const roomKey = message.slice(11, message.length);
        socket.emit("#room/join", roomKey);
        setMessage("");
      } else if (message.slice(0, 13) === "#room/delete/") {
        const roomKey = message.slice(13, message.length);
        socket.emit("#room/delete", roomKey);
        setMessage("");
      } else {
        socket.emit("sendMessage", message);
        setMessage("");
      } //the callback function resets the message state to an empty string
    }
  };

  //and then add a bunch of components/JSX below to render a proper looking Chat component
  return (
    <div className="outerContainer">
      {console.log("RENDERED", messages)}
      <div className="container">
        <SideBar sideBarOpen={sideBarOpen} toggleSideBar={toggleSideBar} />

        <InfoBar
          name={name}
          toggleSideBar={toggleSideBar}
          setCanSpeak={setCanSpeak}
          canSpeak={canSpeak}
          sideBarOpen={sideBarOpen}
          messages={messages}
        />

        <Messages messages={messages} name={name} />
        <InputBar
          pattern={"(^[ a-z0-9]{2,100}$)|(^<3$)|(^#news$)|(^#chat$)"}
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
