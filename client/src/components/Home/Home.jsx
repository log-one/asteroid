import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import InfoBar from "../InfoBar/InfoBar";
import SideBar from "../SideBar/SideBar";
import UserData from "./UserData/UserData";
import NavBar from "../NavBar/NavBar";
import jwtDecode from "jwt-decode";

import "./Home.css";
import helpIcon from "../../icons/helpIcon.svg";

let socket;
//the location prop comes from React-Router in App.js
const Home = () => {
  const [name, setName] = useState("");

  const [sideBarOpen, setSideBarOpen] = useState(false);

  const ENDPOINT = "localhost:5000";

  useEffect(() => {
    //create a socket object on the client side
    socket = io(ENDPOINT); //emits a 'connection' event to ENDPOINT along with 'socket' object?
    //this socket object is connected to the socket object on the server side through the endpoint URL
  }, []);

  useEffect(() => {
    const jwt = localStorage.getItem("token");
    const { name: userName } = jwtDecode(jwt);

    //if payload is successfully extracted from jwt, emit "join" event
    if (userName) {
      setName(userName.trim().toLowerCase());
      socket.emit("join", userName);
    }

    //describe what needs to be done as the component unmounts
    return () => {
      socket.emit("disconnect");
      socket.off();
    };
  }, [ENDPOINT]);

  //function to toggle sidebar
  const toggleSideBar = (event) => {
    event.preventDefault();
    setSideBarOpen(!sideBarOpen);
  };

  return (
    <div className="outerContainer">
      {console.log("RENDERED")}
      <div className="homeContainer">
        <div className="titleBar">
          <h1>hi {name}</h1>
          <button className="helpButton">
            <img className="helpIcon" src={helpIcon} alt="help icon" />
          </button>
        </div>

        <UserData name={"vida"} numHumans={6} numMessages={235} />

        <button className="findHumans">
          <span>chat</span>
        </button>
        <p>2593 humans are searching for the perfect stranger...</p>
        <NavBar pageName="home" />
      </div>
    </div>
  );
};

export default Home;
