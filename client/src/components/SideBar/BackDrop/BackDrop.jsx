import React from "react";
import "./BackDrop.css";

const BackDrop = ({ toggleSideBar }) => {
  return (
    <div className="back-drop" onClick={(event) => toggleSideBar(event)}></div>
  );
};

export default BackDrop;
