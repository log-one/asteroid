import React from "react";

import socket from "../../services/socketService";

import "./InputBar.css";

import sendIcon from "../../icons/send.svg";

const InputBar = ({
  userName,
  chatState,

  canSpeak,
  message,
  setMessage,
  sendMessage,
  history,
}) => {
  if (chatState === "random-chat-over") {
    return (
      <div className="chatOverButtons">
        <button
          className="skipButton"
          onClick={() => socket.emit("#skip", userName)}
        >
          skip
        </button>
      </div>
    );
  } else {
    return (
      <form className="form">
        <input
          className="input"
          type="text"
          placeholder={canSpeak ? "send a message" : "await your turn..."}
          disabled={!canSpeak}
          pattern={
            "(^[ a-z0-9]{1,100}$)|(^#news$)|(^#skip$)|(^#ilikeyou$)|(^#destroy$)"
          }
          value={canSpeak ? message : ""} //this makes the input field empty again when the 'message' state becomes an empty string every time a message is sent
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => (e.key === "Enter" ? sendMessage(e) : null)}
        />
        <div className="sendButton" onClick={(e) => sendMessage(e)}>
          <img className="sendIcon" src={sendIcon} alt="send button icon" />
        </div>
      </form>
    );
  }
};

export default InputBar;
