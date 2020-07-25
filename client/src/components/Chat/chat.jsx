import React, { useState, useEffect } from "react";

import InfoBar from "../InfoBar/InfoBar";
import InputBar from "../InputBar/InputBar";
import Messages from "../Messages/Messages";
import SideBar from "../SideBar/SideBar";
import FriendsList from "../FriendsList/FriendsList";
import OnlineList from "../OnlineList/OnlineList";

import socket from "../../services/socketService";

import "./Chat.css";

//the location prop comes from React-Router in App.js
const Chat = ({ friends, userName, history, match, showTimer }) => {
  const [chatState, setChatState] = useState("");
  const [messages, setMessages] = useState([]); //array of all messages
  const [infoBarText, setInfoBarText] = useState({ creator: "", roomName: "" });
  const [roomMembers, setRoomMembers] = useState([]);
  const [addableFriends, setAddableFriends] = useState([]);
  //above array of messages should be in a DB
  const [message, setMessage] = useState(""); // each message
  // const [enqueued, setEnqueued] = useState(false);
  const [showOnlineList, setShowOnlineList] = useState(false);
  const [showFriendsList, setShowFriendsList] = useState(false);
  const [canSpeak, setCanSpeak] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);
  const [resetTimer, setResetTimer] = useState(true);

  //useEffect to randomly set canSpeak
  useEffect(() => {
    socket.on("can-speak", (canSpeakBoolean) => {
      setCanSpeak(canSpeakBoolean);
    });

    return () => {
      socket.off("can-speak");
    };
  }, [canSpeak]);

  //useeffect to use path and let server know where the user currently is or redirect home if path is invalid
  useEffect(() => {
    if (userName) {
      //let server know user is in PRIVATE CHAT
      if (match.params.friend) {
        socket.emit("/private-chat", { userName, friend: match.params.friend });
        setChatState("private-chat");
      }

      //let server know user is in PRIVATE ROOM
      else if (match.params.creator && match.params.room) {
        socket.emit("/private-room", {
          userName,
          creator: match.params.creator,
          roomName: match.params.room,
        });
        setChatState("private-room");
      }
      //let server know user is in RANDOM CHAT
      else if (
        history.location.pathname === "/app/chat" ||
        history.location.pathname === "/app/chat/"
      ) {
        socket.emit("/random-chat", userName);
        setChatState("in-queue");
      } else {
        //change URL To /app
        history.replace("/app");
        setChatState("");
      }
    }
    // eslint-disable-next-line
  }, [userName]);

  //set infobar details (room name and creator name)
  useEffect(() => {
    socket.on("infoBarText", (text) => {
      setInfoBarText(text);
      console.log("INFOBAR TEXT IS", text);
    });

    console.log("INFOBAR TEXT ISSSSSSSSSSSSSS", infoBarText);
    if (
      infoBarText.roomName &&
      !infoBarText.creator &&
      (history.location.pathname === "/app/chat" ||
        history.location.pathname === "/app/chat/")
    )
      setChatState("random-chat-start");

    return () => {
      socket.off("infoBarText");
    };
    // eslint-disable-next-line
  }, [infoBarText, userName]);

  // listener to update room members on initial entry or when member is added/removed
  useEffect(() => {
    socket.on("load-room-members", (updatedList) => {
      setRoomMembers(updatedList);
    });

    return () => {
      socket.off("load-room-members");
    };
  }, [roomMembers, userName]);

  // listener to update addable friends on initial entry or when member is added/removed
  useEffect(() => {
    socket.on("load-addable-friends", (updatedList) => {
      console.log(updatedList);
      setAddableFriends(updatedList);
    });

    return () => {
      socket.off("load-addable-friends");
    };
  }, [addableFriends, userName]);

  //the next useEffect() adds listeners to handle message updating, clearing and loading
  useEffect(() => {
    socket.on("message", (message) => {
      if (message.user) socket.emit("update-messages", { message, userName });
      setMessages((messages) => [...messages, message]); //this is adding every new message sent by admin or any user to our messages array

      //change chat state to render skip button when user leaves room
      if (
        !message.user &&
        message.text === "you may return home or skip to find another human"
      )
        setChatState("random-chat-over");
      else if (
        !message.user &&
        message.text === "searching for the perfect human..."
      )
        setChatState("in-queue");
    });

    //event listener to clear messages
    socket.on("clear-messages", () => {
      setMessages([]);
    });

    //event listener to load previous messages
    socket.on("load-prev-messages", (oldMessages) => {
      setMessages(oldMessages);
    });

    //make user eligible to speak if most recent message was sent by peer in random chat state

    if (chatState === "random-chat-start" && infoBarText.roomName) {
      if (messages.length > 0) {
        if (messages[messages.length - 1].user === userName) {
          console.log("the ifff", messages[messages.length - 1], canSpeak);
          setCanSpeak(false);
        } else if (
          messages[messages.length - 1].user &&
          messages[messages.length - 1].user !== "admin"
        ) {
          console.log(messages[messages.length - 1], canSpeak);
          setCanSpeak(true);
        } else
          console.log(
            "wut in the act fick",
            messages[messages.length - 1],
            canSpeak
          );
      }
    }

    return () => {
      socket.off("message");
      socket.off("clear-messages");
      socket.off("load-prev-messages");
    };
    // eslint-disable-next-line
  }, [messages, userName, chatState]);

  //reset timer to 40 seconds whenever canSpeak changes
  useEffect(() => {
    setResetTimer(true);
  }, [canSpeak, chatState]);

  //effect to update timer every second
  useEffect(() => {
    //logic to run timer when chat is in session
    if (resetTimer === false && chatState === "random-chat-start") {
      setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else {
      setResetTimer(false);
      setTimeLeft(40);
    }

    //return user home if they run out of time when it is their turn to speak
    if (
      timeLeft === -1 &&
      canSpeak === true &&
      chatState === "random-chat-start"
    ) {
      //return user home if he runs out of time
      history.replace("/app/home");
    }

    // eslint-disable-next-line
  }, [timeLeft, chatState]);

  //function to toggle sidebar
  const toggleShowOnlineList = (event) => {
    event.preventDefault();
    if (chatState === "private-room") setShowOnlineList(!showOnlineList);
  };

  //function to toggle sidebar
  const toggleShowFriendsList = (event) => {
    event.preventDefault();
    setShowFriendsList(!showFriendsList);
  };

  //create a function to send messages (once a message is typed and entered in the chatbox)
  const sendMessage = (event) => {
    event.preventDefault(); //clicking a button or onKeyPress refreshes the whole page. This prevents that default behaviour from happening

    if (message) {
      if (message === "#skip" && !match.params.friend && !match.params.room) {
        socket.emit("#skip", userName);
        setMessage("");
      } else if (
        message === "#iloveyou" &&
        !match.params.friend &&
        !match.params.room
      ) {
        socket.emit("#iloveyou", {
          userName,
          lastMessage: messages[messages.length - 1],
        });
        setMessage("");
      } else if (message === "#destroy") {
        socket.emit("#destroy", {
          userName,
          pathName: history.location.pathname,
        });
        setMessage("");
      } else {
        socket.emit("sendMessage", {
          message,
          userName,
          lastMessage: messages[messages.length - 1],
        });

        setMessage("");
      } //the callback function resets the message state to an empty string
    }
  };

  //and then add a bunch of components/JSX below to render a proper looking Chat component
  return (
    <div className="outerContainer">
      {console.log("RENDERED CHAT")}
      <div className="container">
        <SideBar
          userName={userName}
          sideBarOpen={showOnlineList}
          toggleSideBar={toggleShowOnlineList}
          ListComponent={OnlineList}
          roomMembers={roomMembers}
          setRoomMembers={setRoomMembers}
          match={match}
        />

        <SideBar
          userName={userName}
          friends={friends}
          addableFriends={addableFriends}
          setAddableFriends={setAddableFriends}
          sideBarOpen={showFriendsList}
          toggleSideBar={toggleShowFriendsList}
          ListComponent={FriendsList}
          match={match}
        />

        <InfoBar
          showTimer={showTimer}
          timeLeft={timeLeft}
          name={userName}
          canSpeak={canSpeak}
          toggleShowOnlineList={toggleShowOnlineList}
          toggleShowFriendsList={toggleShowFriendsList}
          messages={messages}
          infoBarText={infoBarText}
        />

        <Messages
          messages={messages}
          chatState={chatState}
          userName={userName}
        />
        <InputBar
          userName={userName}
          message={message}
          name={userName}
          setMessage={setMessage}
          sendMessage={sendMessage}
          canSpeak={canSpeak}
          chatState={chatState}
          history={history}
        />
      </div>
    </div>
  );
};

export default Chat;
