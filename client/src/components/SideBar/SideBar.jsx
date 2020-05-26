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
          <div className="onlineList">
            <div className="dotContainer"></div>
            <div className="userNames"></div>
          </div>
        </div>
      </div>
    );
  else return null;
};

export default SideBar;
