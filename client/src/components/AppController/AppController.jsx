import React, { useState, useEffect } from "react";
import { Switch, Route } from "react-router-dom";
import Home from "../Home/Home";
import Rooms from "../Rooms/Rooms";
import Friends from "../Friends/Friends";
import Chat from "../Chat/Chat";

import socket from "../../services/socketService";

const AppController = ({ userName, location, history }) => {
  const [stats, setStats] = useState({ usersMet: 0, messagesSent: 0 });
  const [onlineCount, setOnlineCount] = useState(0);
  const [rooms, setRooms] = useState([]);
  const [friends, setFriends] = useState([]);

  //listener to return user to /rooms
  useEffect(() => {
    socket.on("return-to-rooms", () => {
      history.replace("/app/rooms");
    });

    return () => {
      socket.off("return-to-rooms");
    };
    // eslint-disable-next-line
  }, [rooms]);

  //listener to return user to /friends
  useEffect(() => {
    socket.on("return-to-friends", () => {
      history.replace("/app/friends");
    });

    return () => {
      socket.off("return-to-friends");
    };
    // eslint-disable-next-line
  }, [friends]);

  //listener to update total online users
  useEffect(() => {
    socket.on("online-count", (newCount) => {
      setOnlineCount(newCount);
    });

    return () => {
      socket.off("online-count");
    };
  }, [onlineCount]);

  //listener to load updated list of rooms for user
  useEffect(() => {
    socket.on("load-rooms", (roomList) => {
      setRooms(roomList);
    });

    return () => {
      socket.off("load-rooms");
    };
  }, [rooms]);

  //listener to load updated user /home stats
  useEffect(() => {
    socket.on("load-stats", (stats) => {
      setStats(stats);
    });

    return () => {
      socket.off("load-stats");
    };
  }, [stats]);

  //listener to load updated list of friends
  useEffect(() => {
    socket.on("load-friends", (friendsAndMsgs) => {
      setFriends(friendsAndMsgs);
    });

    return () => {
      socket.off("load-friends");
    };
  }, [friends]);

  //emit join event when user successfully logs in
  useEffect(() => {
    if (userName) {
      socket.emit("join", { userName, currentPath: location.pathname });
    }

    //describe what needs to be done as the component unmounts
    return () => {
      //alert("DISCONNECTING", userName);
      //  socket.emit("disconnect", userName);
      socket.off();
    };

    // eslint-disable-next-line
  }, [userName]);

  return (
    <Switch>
      <Route
        path="/app/home"
        render={(props) => (
          <Home
            userName={userName}
            stats={stats}
            onlineCount={onlineCount}
            {...props}
          />
        )}
      />

      <Route
        path="/app/rooms/:creator/:room"
        render={(props) => (
          <Chat
            userName={userName}
            showTimer={false}
            friends={friends}
            {...props}
          />
        )}
      />
      <Route
        path="/app/rooms"
        render={(props) => (
          <Rooms userName={userName} rooms={rooms} {...props} />
        )}
      />
      <Route
        path="/app/friends/:friend"
        render={(props) => (
          <Chat
            userName={userName}
            friends={friends}
            showTimer={false}
            {...props}
          />
        )}
      />
      <Route
        path="/app/friends"
        render={(props) => (
          <Friends userName={userName} friends={friends} {...props} />
        )}
      />

      <Route
        path="/app/chat"
        render={(props) => (
          <Chat
            userName={userName}
            friends={friends}
            showTimer={true}
            {...props}
          />
        )}
      />
      <Route
        path="/"
        render={(props) => (
          <Home
            userName={userName}
            stats={stats}
            onlineCount={onlineCount}
            {...props}
          />
        )}
      />
    </Switch>
  );
};

export default AppController;
