import React from "react";
import socket from "../../services/socketService";

import addFriendsIcon from "../../icons/addFriendsIcon.svg";

import "./FriendsList.css";

const FriendsList = ({ match, addableFriends, setAddableFriends }) => {
  function handleAddFriend(index) {
    const newArray = [...addableFriends];

    const newMember = newArray.splice(index, 1)[0];

    socket.emit("add-room-member", {
      newMember,
      creator: match.params.creator,
      roomName: match.params.room,
    });

    //update friends array
    setAddableFriends(newArray);
  }

  return (
    <React.Fragment>
      <h2 className="barHeading"> add friends </h2>
      <ul className="addFriendsList">
        {addableFriends.map((friend, index) => (
          <li className="addFriendsListItem">
            <div className="addFriendNameWrapper">
              <button className="addFriendName"></button>
              <p>{friend}</p>
            </div>
            <button
              className="addFriend"
              onClick={() => handleAddFriend(index)}
            >
              <img
                className="addFriendsIcon"
                src={addFriendsIcon}
                alt="add button"
              />
            </button>
          </li>
        ))}
      </ul>
    </React.Fragment>
  );
};

export default FriendsList;
