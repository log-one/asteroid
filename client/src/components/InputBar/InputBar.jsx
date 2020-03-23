import React, { Component } from "react";

import "./InputBar.css";

const InputBar = ({ canSpeak, message, setMessage, sendMessage, pattern }) => {
  if (canSpeak.eligible) {
    return (
      <form className="form">
        <input
          className="input"
          type="text"
          placeholder="Type a message..."
          pattern={pattern}
          value={message} //this makes the input field empty again when the 'message' state becomes an empty string every time a message is sent
          onChange={e => setMessage(e.target.value)}
          onKeyPress={e => (e.key === "Enter" ? sendMessage(e) : null)}
        />
        <button className="sendButton" onClick={e => sendMessage(e)}>
          Send
        </button>
      </form>
    );
  } else {
    return (
      <form className="form">
        <input
          className="input"
          type="text"
          value=""
          placeholder="You just spoke. Time to listen..."
          onKeyPress={e => (e.key === "Enter" ? sendMessage(e) : null)}
          disabled
        />
        <button className="sendButton" onClick={e => sendMessage(e)}>
          Send
        </button>
      </form>
    );
  }
};

export default InputBar;
