import React from "react";
import { useState, useEffect } from "react";
import "./Timer.css";

const Timer = ({ canSpeak, setCanSpeak, messages, name }) => {
  const [timeLeft, setTimeLeft] = useState(60);
  useEffect(() => {
    if (timeLeft > 0) {
      if (canSpeak.eligible === true)
        setTimeout(() => {
          setTimeLeft(timeLeft - 1);
        }, 1000);
      else {
        if (messages) {
          const lastMsg = messages[messages.length - 1];
          if (lastMsg.link && lastMsg.user !== name) setTimeLeft(180);
          else setTimeLeft(60);
        }
      }
    } else if (canSpeak.eligible === true)
      setCanSpeak({ eligible: false, lastMessageNum: canSpeak.lastMessageNum });
  }, [timeLeft, canSpeak]);

  return (
    <div className={timeLeft > 5 ? "timerBadgeWarning" : "timerBadgeWarning"}>
      <p>{timeLeft} s</p>
    </div>
  );
};

export default Timer;
