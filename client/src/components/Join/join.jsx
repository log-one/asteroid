import React, { Component, useState } from "react";
import { Link } from "react-router-dom";

import "./join.css";

const Join = () => {
  //add state variables
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");

  //describe the view
  return (
    <div className="joinOuterContainer">
      <div className="joinInnerContainer">
        <h1 className="heading">Join</h1>
        <div>
          <input
            placeholder="User"
            className="joinInput"
            type="text"
            onChange={event => setName(event.target.value)}
          />
        </div>
        <div>
          <input
            placeholder="Room"
            className="joinInput mt-20"
            type="text"
            onChange={event => setRoom(event.target.value)}
          />
        </div>
        <Link to={`/chat?name=${name}&room=${room}`}>
          <button className="button mt-20" type="submit">
            Sign in
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Join;
