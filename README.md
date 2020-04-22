<<<<<<< HEAD
# chit

A chat app with interesting rules.
The app is currently under development, and will be updated once it is deployed.

This application was built using ReactJS, Node.js, Express.js, MongoDB and Socket.io.

Chat apps can be boring because the users usually have to do all the work of keeping a conversation going.

Chit is a chat environment with rules, easter egg-like functions and an interesting aesthetic.

1. Users speak according to a turn-based system. After sending a message (depending on the number of users) the user must sit back and listen
   to one or more other users to speak before he can speak again.
2. There is a time limit for each user to send a message.
3. For the sake of brevity and a consistent aesthetic, there are limitations to the message content and message length.
4. W
=======
**_Note: This project is still in progress._** 

### Building Blocks
* ReactJS    
* Node.js 
* Express.js  
* MongoDB 
* Socket.io
* NewsAPI

### Motivation:
Having good conversations with strangers on most chat services is hit or miss. Users usually have to do all the work of keeping a decent conversation going. Sometimes users speak too much or spam the chat. Sometimes there is nothing to talk about. Sometimes users just lurk and remain inactive. This chat service takes away some of that responsibility from the user and incentivizes them to talk and have a good conversation. 

### Screenshot:
![](chit-updated.png)
_Note: This is not the final version. I'm just experimenting with the UI design._

### Features:
Chit is a chat environment with certain rules, tools and an interesting aesthetic. Strangers are matched and given the opportunity to interact in this environment. Some of the features include:
  * Users speak according to a turn-based system. After sending a message the user must sit back and wait for the other user to speak before they can speak again.
  * There is a window of time within which a user must send a message when it is their turn to speak. When the built-in timer reaches zero, they miss their turn to speak.
  * If a user times out 3 times, they get kicked out of the room for inactivity and their IP address is temporarily banned.
  * For the sake of brevity and a consistent aesthetic, there are limitations to the size and type of the message content.
  * Users may use tools such as the #news command to help spark a conversation. #news returns the latest news from NewsAPI. A few more interesting commands will be added soon.

>>>>>>> 0cb3874412a531cac1a1483a0f0a4bf3f7ab80b6
