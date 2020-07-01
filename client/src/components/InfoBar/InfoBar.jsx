import React from "react";
import Timer from "../Timer/Timer";
import "./InfoBar.css";

// onClick={(event) => props.toggleSideBar(event)}

const InfoBar = (props) => {
  return (
    <div className="infoBar">
      {props.pageName !== "home" ? (
        <Timer
          setCanSpeak={props.setCanSpeak}
          canSpeak={props.canSpeak}
          messages={props.messages}
          name={props.name}
          enqueued={props.enqueued}
        />
      ) : (
        <button className="helpButton">butt</button>
      )}
    </div>
  );
};

export default InfoBar;
