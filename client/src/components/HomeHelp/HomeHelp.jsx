import React from "react";

import "./HomeHelp.css";
const HomeHelp = () => {
  return (
    <div className="helpMenu">
      <h3>features</h3>

      <ul className="features">
        <li>use the chat button to be randomly matched with a stranger.</li>
        <li>chat is turn-based.</li>
        <li>send messages before the timer runs out.</li>
        <li>all past conversations are saved.</li>
        <li>only text commands, lowercase letters and numbers are allowed.</li>
        <li>chat with friends anytime.</li>
        <li>create rooms and add friends to them.</li>
      </ul>
      <h3>text commands</h3>
      <ul className="textCommands">
        <li>
          type <span>#skip</span> to skip to the next human.
        </li>
        <li>
          type <span>#ily</span> to invite a stranger to be your friend.
        </li>
        <li>
          type <span>#news</span> to send the summary of a random recent news
          article.
        </li>
        <li>
          type <span>#destroy</span> to either destroy a friendship or a room.
        </li>
      </ul>
    </div>
  );
};

export default HomeHelp;
