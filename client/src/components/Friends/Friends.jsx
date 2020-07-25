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
      {console.log("RENDERED FRIENDS")}
      <div className="friendsContainer">
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
                  <h2>{friend.userName}</h2>
                  <p>{friend.lastMessage}</p>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <h3>you have no friends</h3>
        )}
        <NavBar />
      </div>
    </div>
  );
};

export default Friends;
