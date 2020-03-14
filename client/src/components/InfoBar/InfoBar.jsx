import React, { Component } from "react";
import { slide as Menu } from "react-burger-menu";

import "./InfoBar.css";
import closeIcon from "../../icons/closeIcon.png";
import onlineIcon from "../../icons/onlineIcon.png";

const InfoBar = props => {
  return (
    <div className="infoBar">
      <div className="leftInnerContainer">
        <img className="onlineIcon" src={onlineIcon} alt="online" />
        <h3>{props.room}</h3>
        <h5 className="roomData">{`${props.users.length} users online`}</h5>
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
