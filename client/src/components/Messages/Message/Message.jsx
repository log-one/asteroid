import React from "react";
import ReactEmoji from "react-emoji";

import "./Message.css";

const Message = ({ message: { user, text, link }, name }) => {
  //logic which determines what kind of Message component is rendered
  let isSentByCurrentUser = false;

  if (user.name === name) {
    isSentByCurrentUser = true;
  }

  // if (msgLength !== -1) {
  //   console.log("MESSAGES", msgLength);
  //   return (
  //     <div className="messageContainer justifyStart firstMessage">
  //       <div className="messageBox backgroundLight">
  //         <p className="messageText colorDark">{ReactEmoji.emojify(text)}</p>
  //       </div>
  //       <p className="sentText pl-10">{user.name}</p>
  //     </div>
  //   );
  // }

  return isSentByCurrentUser ? (
    <div className="messageContainer justifyEnd">
      <p className="sentText pr-10">{user.name}</p>
      <div className="messageBox backgroundBlue">
        <p className="messageText colorWhite">
          {ReactEmoji.emojify(text)}
          {link ? <a href={link}>{" " + "here's the full story."}</a> : null}
        </p>
      </div>
    </div>
  ) : (
    <div className="messageContainer justifyStart">
      <div className="messageBox backgroundLight">
        <p className="messageText colorDark">
          {ReactEmoji.emojify(text)}
          {link ? <a href={link}>{" " + "here's the full story."}</a> : null}
        </p>
      </div>
      <p className="sentText pl-10">{user.name}</p>
    </div>
  );
};

export default Message;
