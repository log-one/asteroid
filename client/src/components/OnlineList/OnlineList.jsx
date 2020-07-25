import React from "react";

import socket from "../../services/socketService";

import "./OnlineList.css";

import removeMemberIcon from "../../icons/removeMemberIcon.svg";

const OnlineList = ({ roomMembers, setRoomMembers, match }) => {
  function handleRemoveMember(index) {
    const newArray = [...roomMembers];

    const removedMember = newArray.splice(index, 1)[0];

    console.log("REMOVED MEMBER IS", removedMember);
    //remove friend that was added to room from addable friends array
    socket.emit("remove-room-member", {
      removedMember: removedMember.name,
      creator: match.params.creator,
      roomName: match.params.room,
    });

    setRoomMembers(newArray);
  }

  return (
    <React.Fragment>
      <h2 className="barHeading">room members</h2>
      <ul className="onlineList">
        {roomMembers.map((roomMember, index) => (
          <li className="onlineListItem">
            <div className="roomMemberWrapper">
              <button
                className={`roomMember  ${roomMember.online && "onlineState"} ${
                  roomMember.name === match.params.creator && "addPadding"
                } `}
              >
                {roomMember.name === match.params.creator && "C"}
              </button>
              <p> {roomMember.name} </p>
            </div>
            {roomMember.name !== match.params.creator && (
              <button
                className="deleteMemberButton"
                onClick={() => handleRemoveMember(index)}
              >
                <img
                  src={removeMemberIcon}
                  alt="remove member icon"
                  className="deleteMemberIcon"
                />
              </button>
            )}
          </li>
        ))}
      </ul>
    </React.Fragment>
  );
};

export default OnlineList;
