import React from "react";
import "./UserData.css";
import messageIcon from "../../../icons/chat_bubble.svg";
import personIcon from "../../../icons/people_alt.svg";

const UserData = ({ name, numHumans, numMessages }) => {
  return (
    <div className="userDataContainer">
      <div>
        <img src={personIcon} alt="person icon" />
        <span> {numHumans} humans met</span>
      </div>
      <div>
        <img src={messageIcon} alt="message icon" />
        <span> {numMessages} messages sent</span>
      </div>
    </div>
  );
};

export default UserData;
