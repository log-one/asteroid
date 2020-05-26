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
  // const [enqueued, setEnqueued] = useState(false);
  const [sideBarOpen, setSideBarOpen] = useState(false);
  const [canSpeak, setCanSpeak] = useState(true);
  const [peers, setPeers] = useState([]); //update

  const ENDPOINT = "localhost:5000";

  console.log("Another State Declaration");

  useEffect(() => {
    console.log("JOIN (first) useEffect()");
    //location.search contains just the query part of the URL
    //queryString.parse() parses it into an object with the query string parameters and values as key-value pairs
    const { name } = queryString.parse(location.search);

    //create a socket object on the client side
    socket = io(ENDPOINT); //emits a 'connection' event to ENDPOINT along with 'socket' object?
    //this socket object is connected to the socket object on the server side through the endpoint URL

    setName(name.trim().toLowerCase());

    //socket.emit() allows us to emit an event to the server and have some data passed along with it
    //the server upon recognizing the emitted event can access the emitted data (if any) and do something
    //a callback function can be passed in the server as the second parameter of the event listener
    //we can define that callback function here to do something after the event has been emitted (ex: to do error handling)
    socket.emit("join", { name }, (e) => {
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

  // this useEffect() updates data about peers in room and re-renders the green dot
  useEffect(() => {
    socket.on("peerChange", (newPeers) => {
      setPeers((peers) => {
        peers.splice(0, peers.length, ...newPeers);
        return peers;
      });
    });

    return () => {
      socket.off("peerChange");
    };
  }, [peers]);

  //this UseEffect() handles changes in the user's room and loads stored messages from database

  useEffect(() => {
    socket.on("room-change", (room, oldMessages) => {
      setRoom(room);
      setMessages((messages) => {
        messages.splice(0, messages.length, ...oldMessages);
        return messages;
      });
    });

    return () => {
      socket.off("room-change");
    };
  }, [room, messages]);

  //the next useEffect() handles the 'message' event and updates the Messages[] state of the Chat component
  useEffect(() => {
    console.log("MESSAGE (THIRD) useEffect()");
    socket.on("message", (message) => {
      socket.emit("update-messages", message);
      setMessages([...messages, message]); //this is adding every new message sent by admin or anyone else to our messages array
      //convert later to promises or async await
    });

    //event listener to clear messages
    socket.on("clear-messages", () => {
      setMessages((messages) => {
        messages.length = 0;
        return messages;
      });
    });

    //event listener to load previous messages
    socket.on("load-prev-messages", (oldMessages) => {
      setMessages((messages) => {
        messages.splice(0, messages.length, ...oldMessages);
        return messages;
      });
    });

    //make user eligible to speak if most recent message was sent by peer
    if (messages.length > 0)
      if (messages[messages.length - 1].user === name) setCanSpeak(false);
      else setCanSpeak(true);

    return () => {
      socket.off("message");
      socket.off("clear-messages");
    };
    // eslint-disable-next-line
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
      if (message === "#chat") {
        socket.emit("#chat", () => setMessage(""));
      } else if (message === "#home") {
        socket.emit("#home", () => setMessage(""));
      } else if (message === "#skip") {
        socket.emit("#skip", () => setMessage(""));
      } else if (message === "#room/new") {
        socket.emit("#room/new", () => setMessage(""));
      } else if (message.slice(0, 11) === "#room/join/") {
        const roomKey = message.slice(11, message.length);
        socket.emit("#room/join", roomKey, () => setMessage(""));
      } else if (message.slice(0, 13) === "#room/delete/") {
        const roomKey = message.slice(13, message.length);
        socket.emit("#room/delete", roomKey, () => setMessage(""));
      } else socket.emit("sendMessage", message, () => setMessage("")); //the callback function resets the message state to an empty string
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
          peers={peers}
        />

        <InfoBar
          name={name}
          toggleSideBar={toggleSideBar}
          setCanSpeak={setCanSpeak}
          canSpeak={canSpeak}
          sideBarOpen={sideBarOpen}
          messages={messages}
          peers={peers}
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
