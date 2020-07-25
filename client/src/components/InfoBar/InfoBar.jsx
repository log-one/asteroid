import React from "react";
import Timer from "../Timer/Timer";

import backIcon from "../../icons/backIcon.svg";

import addToRoomIcon from "../../icons/addToRoomIcon.svg";

import "./InfoBar.css";

// onClick={(event) => props.toggleSideBar(event)}

const InfoBar = ({
  showTimer,
  infoBarText,
  timeLeft,
  canSpeak,
  toggleShowOnlineList,
  toggleShowFriendsList,
}) => {
  return (
    <div className="infoBar">
      <button
        className={`leftContainer ${
          infoBarText.creator ? "orangeBg" : showTimer ? "greenBg" : "blueBg"
        }`}
        onClick={(e) => toggleShowOnlineList(e)}
      >
        <button className="backButton" onClick={() => window.history.back()}>
          <img className="backIcon" src={backIcon} alt="back button" />
        </button>

        {infoBarText.roomName}
      </button>
      {showTimer && <Timer timeLeft={timeLeft} canSpeak={canSpeak} />}

      {infoBarText.creator && (
        <button className="addToRoom" onClick={(e) => toggleShowFriendsList(e)}>
          <img
            className="addToRoomIcon"
            src={addToRoomIcon}
            alt="add friend button"
          />
        </button>
      )}
    </div>
  );
};

export default InfoBar;
