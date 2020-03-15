import React from "react";
import "./SideBar.css";

import BackDrop from "./BackDrop/BackDrop";

const SideBar = props => {
  if (props.sideBarOpen)
    return (
      <div
        className="side-bar-container"
        onClick={event => props.toggleSideBar(event)}
      >
        <div className="side-bar">
          {/* <h3>{`${props.users.length} online`}</h3> */}
          <ul>
            {props.users.map(user => (
              <li key={user.id}>{user.name}</li>
            ))}
          </ul>
        </div>
        <BackDrop />
      </div>
    );
  else return null;
};

export default SideBar;
