import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import UserData from "./UserData/UserData";
import NavBar from "../NavBar/NavBar";
import SideBar from "../SideBar/SideBar";

import socket from "../../services/socketService";

import { logout } from "../../services/authService";

import "./Home.css";
import HomeHelp from "../HomeHelp/HomeHelp";

//the location prop comes from React-Router in App.js
const Home = ({ userName, stats, onlineCount }) => {
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    socket.emit("/home", userName);
  }, [userName]);

  function toggleShowHelp() {
    setShowHelp(!showHelp);
  }

  return (
    <div className="outerContainer">
      <div className="homeContainer">
        <SideBar
          userName={userName}
          sideBarOpen={showHelp}
          toggleSideBar={toggleShowHelp}
          ListComponent={HomeHelp}
        />
        <div className="titleBarHome">
          <button className="hiButton" onClick={toggleShowHelp}>
            hi {userName}
          </button>

          <button className="logoutButton" onClick={logout}>
            log out
          </button>
        </div>

        <UserData stats={stats} />

        <Link to="/app/chat">
          <button className="findHumans">
            <span>chat</span>
          </button>
        </Link>
        <p className="humansOnline">
          {onlineCount + 1346} humans are searching for the perfect stranger...
        </p>
        <NavBar pageName="home" />
      </div>
    </div>
  );
};

export default Home;
