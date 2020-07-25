import React from "react";
import "./UserData.css";
import messageIcon from "../../../icons/chat_bubble.svg";
import personIcon from "../../../icons/people_alt.svg";

const UserData = ({ stats }) => {
  return (
    <div className="userDataContainer">
      <div>
        <img src={personIcon} alt="person icon" />
        <span> {stats.usersMet} humans met</span>
      </div>
      <div>
        <img src={messageIcon} alt="message icon" />
        <span> {stats.messagesSent} messages sent</span>
      </div>
    </div>
  );
};

export default UserData;
