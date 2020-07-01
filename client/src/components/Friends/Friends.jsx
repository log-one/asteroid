import React, { useState } from "react";
import NavBar from "../NavBar/NavBar";

import deleteIcon from "../../icons/deleteIcon.svg";

import "./Friends.css";

const Friends = () => {
  return (
    <div className="outerContainer">
      {console.log("RENDERED")}
      <div className="homeContainer">
        <div className="titleBar">
          <h1>friends</h1>
        </div>
        <NavBar />
      </div>
    </div>
  );
};

export default Friends;
