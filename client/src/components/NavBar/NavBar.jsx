import React from "react";
import { Link } from "react-router-dom";

import friendIcon from "../../icons/friendIcon.svg";
import homeIcon from "../../icons/homeIcon.svg";
import roomIcon from "../../icons/roomIcon.svg";
import "./NavBar.css";

const NavBar = ({ pageName }) => {
  return (
    <div className="navBar">
      <Link to="/rooms">
        <button>
          <img src={roomIcon} alt="rooms nav icon"></img>
          <p>rooms</p>
        </button>
      </Link>

      <Link to="/home">
        <button>
          <img src={homeIcon} alt="home nav icon"></img>
          <p>home</p>
        </button>
      </Link>
      <Link to="/friends">
        <button>
          <img src={friendIcon} alt="friends nav icon"></img>
          <p>friends</p>
        </button>
      </Link>
    </div>
  );
};

export default NavBar;
