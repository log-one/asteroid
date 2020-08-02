import React from "react";

import "./Message.css";

const Message = ({ message: { user, text, link }, userName, chatState }) => {
  //logic which determines what kind of Message component is rendered
  let isSentByCurrentUser = false;
  let isSentByAdmin = false;

  if (user === userName) isSentByCurrentUser = true;

  if (user === "admin") isSentByAdmin = true;

  return isSentByCurrentUser ? (
    <div className="messageContainer justifyEnd">
      <p className="sentText pr-10">{user}</p>
      <div
        className={`messageBox ${
          chatState === "private-chat"
            ? "backgroundBlue"
            : chatState === "private-room"
            ? "backgroundOrange"
            : text === "#iloveyou"
            ? "backgroundBlue"
            : "backgroundGreen"
        } `}
      >
        <p className="messageText colorWhite">
          {text}
          {link ? <a href={link}>{" here's the full story."}</a> : null}
        </p>
      </div>
    </div>
  ) : (
    <div
      className={`messageContainer justifyStart ${
        isSentByAdmin ? "adminEdge" : "senderEdge"
      }`}
    >
      <div
        className={`messageBox ${
          isSentByAdmin
            ? "backgroundAdmin"
            : text === "#iloveyou"
            ? "backgroundBlue"
            : "backgroundLight"
        }`}
      >
        <p
          className={`messageText ${
            isSentByAdmin
              ? "colorAdmin"
              : text === "#iloveyou"
              ? "colorWhite"
              : "colorDark"
          }`}
        >
          {text}
          {link ? <a href={link}>{" here's the full story."}</a> : null}
        </p>
      </div>
      <p className="sentText pl-10">{user}</p>
    </div>
  );
};

export default Message;
