import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Register from "./components/Register/Register";
import Login from "./components/Login/Login";
import Chat from "./components/Chat/Chat";
import Home from "./components/Home/Home";
import Rooms from "./components/Rooms/Rooms";
import Friends from "./components/Friends/Friends";

import "react-toastify/dist/ReactToastify.css";

const App = () => {
  return (
    <React.Fragment>
      <Router>
        <Route path="/" exact component={Register} />
        <Route path="/login" exact component={Login} />
        <Route path="/register" exact component={Register} />
        <Route path="/chat" exact component={Chat} />
        <Route path="/home" exact component={Home} />
        <Route path="/rooms" exact component={Rooms} />
        <Route path="/friends" exact component={Friends} />
      </Router>
      <ToastContainer position="bottom-center" />
    </React.Fragment>
  );
};

export default App;
