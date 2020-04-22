import React from "react";
import "./SideBar.css";
import BackDrop from "./BackDrop/BackDrop";

const SideBar = (props) => {
  if (props.sideBarOpen)
    return (
      <div
        className="side-bar-container"
        onClick={(event) => props.toggleSideBar(event)}
      >
        <BackDrop />

        <div className="side-bar">
          <div className="roomName">{props.room.toLowerCase()}</div>
          <div className="onlineList">
            <div className="dotContainer">
              {props.users.map(() => (
                <div class="sidebarDot"></div>
              ))}
            </div>
            <div className="userNames">
              {props.users.map((user) => (
                <p key={user.id}>{user.name}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  else return null;
};

export default SideBar;
