import React, { Component } from "react";
import ScrollToBottom from "react-scroll-to-bottom";
import Message from "./Message/Message";

import "./Messages.css";

const Messages = ({ messages, name }) => {
  const trimmedName = name.trim().toLowerCase();

  // if (
  //   (messages.length === 1 &&
  //     messages[messages.length - 1].user === trimmedName) ||
  //   (messages.length > 1 && messages[messages.length - 2].user === trimmedName)
  // )
  //   setCanSpeak(false);
  // else setCanSpeak(true);

  return (
    <ScrollToBottom className="messages">
      {messages.map((message, index) => (
        <div key={index}>
          <Message message={message} />
        </div>
      ))}
    </ScrollToBottom>
  );
};

export default Messages;
