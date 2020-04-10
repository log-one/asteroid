**_Note: This project is still in progress._** 

### Building Blocks
* ReactJS    
* Node.js 
* Express.js  
* MongoDB 
* Socket.io
* NewsAPI

### Motivation:
Chat apps can be boring because the users usually have to do all the work of keeping a conversation going. Sometimes users speak too much or spam the chat. Sometimes there is nothing to talk about. Sometimes users just lurk and remain inactive. This chat app seeks to reduce the possibility of encountering such dull moments. 

### Features:
Chit is a chat environment with certain rules, easter egg-like functions and an interesting aesthetic. Some of the features include:
  * Users speak according to a turn-based system. After sending a message (depending on the number of users) the user must sit back and wait for one or more other users to speak before he can speak again.
  * There is a window of time within which a user must send a message when it is their turn to speak. When the built-in timer reaches zero, they lose their ability to speak.
  * If a user times out 3 times, they get kicked out of the room for inactivity and their IP address is temporarily banned.
  * For the sake of brevity and a consistent aesthetic, there are limitations to the size and type of the message content.
  * Users may use a #command such as #news to receive the latest news from a News API. More commands may be added in the future. 
