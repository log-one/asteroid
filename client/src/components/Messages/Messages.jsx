import React, { useRef, useEffect } from "react";
import Message from "./Message/Message";

import "./Messages.css";

const Messages = ({ messages, userName, chatState }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current.scrollIntoView({ behaviour: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  return (
    <React.Fragment>
      <div className="emptySpace"></div>
      <div className="messages">
        {messages.map((message, index) => (
          <div key={index}>
            <Message
              message={message}
              chatState={chatState}
              userName={userName}
            />
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>
      <div className="emptySpace2"></div>
    </React.Fragment>
  );
};

export default Messages;
