import React, { Component } from "react";

import "./InputBar.css";

const InputBar = ({ message, setMessage, sendMessage, pattern }) => {
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
      <button className="sendButton" onClick={event => sendMessage(event)}>
        Send
      </button>
    </form>
  );
};

export default InputBar;
