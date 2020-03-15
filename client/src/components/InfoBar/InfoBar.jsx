import React, { Component } from "react";

import "./InfoBar.css";
import closeIcon from "../../icons/closeIcon.png";
import onlineIcon from "../../icons/onlineIcon.png";

const InfoBar = props => {
  return (
    <div className="infoBar">
      <div
        className="leftInnerContainer"
        onClick={event => props.toggleSideBar(event)}
      >
        <h3 className="numUsers">{`(${props.users.length}) `}</h3>
        <h3>{props.room}</h3>
      </div>
      <div className="rightInnerContainer">
        <a href="/">
          <img src={closeIcon} alt="close" />
        </a>
      </div>
    </div>
  );
};

export default InfoBar;
