# asteroid

**_Note: This project is still in progress._**

### Building Blocks

- ReactJS
- Node.js
- Express.js
- MongoDB
- Socket.io
- NewsAPI

### Motivation:

Having good conversations with strangers on most chat services is a hit or miss. Users usually have to do all the work of keeping a decent conversation going. Sometimes users speak too much or spam the chat. Sometimes there is nothing to talk about. Sometimes users just lurk and remain inactive. This chat service takes away some of that responsibility from the user and incentivizes them to talk and have a good conversation.

### Screenshot:

![](chit-updated.png)
_Note: This is not the final version. I'm just experimenting with the UI design._

### Features:

Asteroid is chat application based on the same basic premise as existing services like Omegle and OmeTV - connect randomly with strangers from around the world.

- Users in random chat speak according to a turn-based system. After sending a message the user must sit back and wait for the other user to speak before they can speak again.
- There is a window of time within which a user must send a message when it is their turn to speak. When the timer reaches zero, they are returned to their home screen.
- If two users in random chat successively send the command #ily to each other, they become friends and gain the ability to remain in touch outside the limitations of random chat through the "friends" screen.
- The #destroy command can be used to destroy a friendship. Doing so will remove the friend from each others' "friends" screen, but all the messages are still saved in the server. So, if the two individuals were to meet again in random chat, they would be able to see all their previous messages, pick up where they left off and perhaps become friends again.
- Using the #destroy command as the creator in a room in the "rooms" screen however, will kick everyone out of the room, destroy it and delete all it's messages from the server.
- For the sake of brevity and a consistent aesthetic, there are limitations to the size and type of the message content. To reduce timeouts and encourage succinctness, no punctuation or special characters are allowed in random chat.
- Users may use tools such as the #news command to help spark a conversation. Sending the #news command returns the summary of a randomly picked recent news article from NewsAPI. A few more interesting commands will be added soon.
