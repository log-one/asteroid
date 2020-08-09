import React from "react";

import "./HomeHelp.css";
const HomeHelp = () => {
  return (
    <div className="helpMenu">
      <h3>features</h3>

      <ul className="features">
        <li>use the chat button to be randomly matched with a stranger.</li>
        <li>random chat is turn-based and timed.</li>
        <li>
          to save time, only text commands and alphabets are allowed in random
          chat.
        </li>
        <li>create and destroy rooms and friendships.</li>
        <li>
          you may chat with friends at any time, with no timer, no turns and no
          restrictions.
        </li>
        <li>all one-on-one conversations are saved.</li>
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
