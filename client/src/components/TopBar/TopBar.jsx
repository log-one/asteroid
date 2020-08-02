import React from "react";
import Timer from "../Timer/Timer";

import backIcon from "../../icons/backIcon.svg";

import addToRoomIcon from "../../icons/addToRoomIcon.svg";

import "./TopBar.css";

// onClick={(event) => props.toggleSideBar(event)}

const TopBar = ({
  showTimer,
  topBarText,
  timeLeft,
  canSpeak,
  toggleShowOnlineList,
  toggleShowFriendsList,
}) => {
  return (
    <div className="topBar">
      <div
        className={`leftContainer ${
          topBarText.creator ? "orangeBg" : showTimer ? "greenBg" : "blueBg"
        }`}
      >
        <button className="backButton" onClick={() => window.history.back()}>
          <img className="backIcon" src={backIcon} alt="back button" />
        </button>

        <button
          className="roomNameBar"
          onClick={(e) => toggleShowOnlineList(e)}
        >
          {topBarText.roomName}
        </button>
      </div>
      {showTimer && <Timer timeLeft={timeLeft} canSpeak={canSpeak} />}

      {topBarText.creator && (
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

export default TopBar;
