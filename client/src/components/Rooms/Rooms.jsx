import React, { useState } from "react";
import "./Rooms.css";
import deleteIcon from "../../icons/deleteIcon.svg";
import NavBar from "../NavBar/NavBar";

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [createRoomState, setCreateRoomState] = useState("button");
  const [newRoom, setNewRoom] = useState("");
  const [portals, setPortals] = useState([]);

  //helper function to render create room button
  function renderCreateRoom() {
    if (createRoomState === "textbox") {
      return (
        <li className="createRoomItem">
          <input
            placeholder="enter room name"
            maxLength="12"
            onChange={(e) =>
              e.target.value
                ? setNewRoom(e.target.value)
                : setCreateRoomState("button")
            }
            required={true}
          ></input>
          <button
            onClick={() => {
              if (newRoom)
                setRooms([...rooms, { name: newRoom, creator: "you!" }]);
              setCreateRoomState("button");
              setNewRoom("");
            }}
            className="createRoomReposition"
          >
            +
          </button>
        </li>
      );
    } else {
      if (rooms.length < 4) {
        return (
          <li className="createRoomItem">
            <button
              onClick={() => setCreateRoomState("textbox")}
              className="createRoom"
            >
              +
            </button>
          </li>
        );
      }
    }
  }

  return (
    <div className="outerContainer">
      {console.log("RENDERED")}
      <div className="homeContainer">
        <div className="titleBar">
          <h1>rooms</h1>
        </div>

        <ul className="roomList">
          {rooms.map((room) => (
            <li>
              {/* <span className="numOnline">7</span> */}
              <button className="roomButton">
                <h3>{room.name}</h3>
                <h5>by</h5>
                <h5>{room.creator}</h5>
              </button>

              {/* <button className="deleteButton">
            <img src={deleteIcon} alt="delete icon" />
          </button> */}
            </li>
          ))}
          {renderCreateRoom()}
        </ul>
        <NavBar />
      </div>
    </div>
  );
};

export default Rooms;
