import React, { useState } from "react";
import { Link } from "react-router-dom";

import "./join.css";

const Join = () => {
  //add state variables
  const [name, setName] = useState("");

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
            onChange={(event) => setName(event.target.value)}
          />
        </div>
        {/* <div>
          <input
            placeholder="Room"
            className="joinInput mt-20"
            type="text"
            onChange={(event) => console.log("password is entered")}
          />
        </div> */}
        <Link
          onClick={(event) => (!name ? event.preventDefault : null)}
          to={`/chat?name=${name}`}
        >
          <button className="button mt-20" type="submit">
            Enter
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Join;
