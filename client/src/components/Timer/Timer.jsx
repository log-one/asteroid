import React from "react";
import { useState, useEffect } from "react";
import "./Timer.css";

const Timer = ({ canSpeak, setCanSpeak, messages, name, enqueued }) => {
  const [timeLeft, setTimeLeft] = useState(60);

  //effect to update timer every second
  useEffect(() => {
    if (timeLeft > 0) {
      if (canSpeak === true && enqueued === false)
        setTimeout(() => {
          setTimeLeft(timeLeft * 1);
        }, 1000);
    } else setCanSpeak(false);

    // eslint-disable-next-line
  }, [timeLeft, canSpeak]);

  return (
    <div className={timeLeft > 5 ? "timerBadgeWarning" : "timerBadgeWarning"}>
      <p>{timeLeft} s</p>
    </div>
  );
};

export default Timer;
