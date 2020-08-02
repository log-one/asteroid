import React, { useState, useEffect } from "react";
import "./Rooms.css";
import NavBar from "../NavBar/NavBar";
import socket from "../../services/socketService";

const Rooms = ({ userName, rooms, history }) => {
  const [createRoomState, setCreateRoomState] = useState("button");
  const [newRoom, setNewRoom] = useState("");

  useEffect(() => {
    socket.emit("/rooms", userName);
  }, [userName]);

  //helper func to parse out creator name and room name
  function parseRoomName(room) {
    const parsedRoom = room.split("/");
    return { creator: parsedRoom[1], roomName: parsedRoom[2] };
  }

  //helper func to create new room
  function createNewRoom() {
    const REGEXpattern = /(^([a-z0-9]+(?: [a-z0-9]+)*)$)/;

    if (REGEXpattern.test(newRoom)) {
      const trimmedNewRoom = newRoom.trim();
      //emit event to add new room to database
      socket.emit("#room/new", { userName, newRoom: trimmedNewRoom });
    }

    setCreateRoomState("button");
    setNewRoom("");
  }

  //helper function to render create room button
  function renderCreateRoom() {
    if (createRoomState === "textbox") {
      return (
        <li className="createRoomItem">
          <input
            placeholder="enter room name"
            maxLength="12"
            pattern="(^([a-z0-9]+(?: [a-z0-9]+)*)$)"
            onChange={(e) =>
              e.target.value
                ? setNewRoom(e.target.value)
                : setCreateRoomState("button")
            }
            required={true}
          ></input>
          <div onClick={createNewRoom} className="createRoomReposition">
            +
          </div>
        </li>
      );
    } else {
      if (rooms.length < 6) {
        return (
          <li className="createRoomItem">
            <button
              onClick={() => setCreateRoomState("textbox")}
              className="createRoom"
            >
              <span className="plusText">+</span>
            </button>
          </li>
        );
      }
    }
  }

  return (
    <div className="outerContainer">
      {console.log("RENDERED")}
      <div className="container">
        <div className="titleBarRooms">
          <h1>rooms</h1>
        </div>

        <ul className="roomList">
          {rooms.map((room) => (
            <li>
              <button
                className="roomButton"
                onClick={() =>
                  history.push(
                    `/app/rooms/${parseRoomName(room).creator}/${
                      parseRoomName(room).roomName
                    }`
                  )
                }
              >
                <h3>{parseRoomName(room).roomName}</h3>
                <h5>by</h5>
                <h5>{parseRoomName(room).creator}</h5>
              </button>
            </li>
          ))}
          {renderCreateRoom()}
        </ul>
        <NavBar current="rooms" />
      </div>
    </div>
  );
};

export default Rooms;
