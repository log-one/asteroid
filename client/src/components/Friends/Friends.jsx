import React, { useEffect } from "react";
import NavBar from "../NavBar/NavBar";

import socket from "../../services/socketService";

import "./Friends.css";

const Friends = ({ userName, friends, history }) => {
  useEffect(() => {
    socket.emit("/friends", userName);
  }, [userName]);

  return (
    <div className="outerContainer">
      <div className="container">
        <div className="titleBarFriends">
          <h1>friends</h1>
        </div>
        {friends.length !== 0 ? (
          <ul className="friendsList">
            {friends.map((friend) => (
              <li className="friendsListItem">
                <button
                  className="dmButton"
                  onClick={() =>
                    history.push(`/app/friends/${friend.userName}`)
                  }
                >
                  <h3>{friend.userName}</h3>
                  <p>{friend.lastMessage}</p>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="noFriendsWrapper">
            <h3 className="noFriends">you have no friends</h3>
          </div>
        )}
        <NavBar current="friends" />
      </div>
    </div>
  );
};

export default Friends;
