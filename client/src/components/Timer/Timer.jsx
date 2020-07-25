import React from "react";
import "./Timer.css";

const Timer = ({ timeLeft, canSpeak }) => {
  return (
    <div className={canSpeak ? "userTimerBadge" : "peerTimerBadge"}>
      <p>{timeLeft} s</p>
    </div>
  );
};

export default Timer;
