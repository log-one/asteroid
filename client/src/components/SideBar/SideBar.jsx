import React from "react";
import "./SideBar.css";
import BackDrop from "./BackDrop/BackDrop";

const SideBar = ({
  ListComponent,
  match,
  addableFriends,
  setAddableFriends,
  roomMembers,
  setRoomMembers,
  sideBarOpen,
  toggleSideBar,
}) => {
  if (sideBarOpen)
    return (
      <div className="side-bar-container">
        <BackDrop toggleSideBar={toggleSideBar} />

        {/* //a bookmark */}
        <div className="side-bar">
          <ListComponent
            roomMembers={roomMembers}
            setRoomMembers={setRoomMembers}
            addableFriends={addableFriends}
            setAddableFriends={setAddableFriends}
            match={match}
          />
        </div>
      </div>
    );
  else return null;
};

export default SideBar;
