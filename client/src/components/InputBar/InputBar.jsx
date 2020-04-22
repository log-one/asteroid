import React from "react";

import "./InputBar.css";
import sendIcon from "../../icons/send.svg";

const InputBar = ({ canSpeak, message, setMessage, sendMessage, pattern }) => {
  if (canSpeak.eligible) {
    return (
      <form className="form">
        <input
          className="input"
          type="text"
          placeholder={`send a message`}
          pattern={pattern}
          value={message} //this makes the input field empty again when the 'message' state becomes an empty string every time a message is sent
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => (e.key === "Enter" ? sendMessage(e) : null)}
        />
        <div className="sendButton" onClick={(e) => sendMessage(e)}>
          <img className="sendIcon" src={sendIcon} />
        </div>
      </form>
    );
  } else {
    return (
      <form className="form">
        <input
          className="input"
          type="text"
          value=""
          placeholder="await your turn..."
          onKeyPress={(e) => (e.key === "Enter" ? sendMessage(e) : null)}
          disabled
        />
        <div className="sendButton" onClick={(e) => sendMessage(e)}>
          <img className="sendIcon" src={sendIcon} />
        </div>
      </form>
    );
  }
};

export default InputBar;
