import React, { Component } from "react";
import ScrollToBottom from "react-scroll-to-bottom";
import Message from "./Message/Message";

import "./Messages.css";

const Messages = ({ messages, name }) => {
  const trimmedName = name.trim().toLowerCase();

  return (
    <ScrollToBottom className="messages">
      <div className="emptySpace"></div>
      {messages.map((message, index) => (
        <div key={index}>
          <Message message={message} name={trimmedName} />
        </div>
      ))}
      <div className="emptySpace2"></div>
    </ScrollToBottom>
  );
};

export default Messages;
