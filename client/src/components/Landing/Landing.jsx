import React, { useState } from "react";

import Login from "../Login/Login";
import Register from "../Register/Register";

import "./Landing.css";

const Landing = ({ history }) => {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div className="outerContainer">
      <div className="landingWrapper">
        <div className="menuWrapper">
          <button
            className={`login ${showLogin && "currSelection"}`}
            onClick={() => setShowLogin(true)}
          >
            login
          </button>
          <button
            className={`register ${!showLogin && "currSelection"}`}
            onClick={() => setShowLogin(false)}
          >
            register
          </button>
        </div>
        {showLogin ? (
          <Login history={history} />
        ) : (
          <Register history={history} />
        )}
      </div>
    </div>
  );
};

export default Landing;
