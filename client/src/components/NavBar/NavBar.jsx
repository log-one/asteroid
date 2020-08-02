import React from "react";
import { Link } from "react-router-dom";

import friendIcon from "../../icons/friendIcon.svg";
import homeIcon from "../../icons/homeIcon.svg";
import roomIcon from "../../icons/roomIcon.svg";

import "./NavBar.css";

const NavBar = ({ current }) => {
  return (
    <div className="navBar">
      <Link to="/app/rooms">
        <button className={current === "rooms" ? "addShadow" : ""}>
          <img src={roomIcon} alt="rooms nav icon"></img>
        </button>
      </Link>

      <Link to="/app/home">
        <button className={current === "home" ? "addShadow" : ""}>
          <img src={homeIcon} alt="home nav icon"></img>
        </button>
      </Link>
      <Link to="/app/friends">
        <button className={current === "friends" ? "addShadow" : ""}>
          <img src={friendIcon} alt="friends nav icon"></img>
        </button>
      </Link>
    </div>
  );
};

export default NavBar;
