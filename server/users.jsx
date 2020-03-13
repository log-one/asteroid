//use this file to create helper functions to manage users

const users = [];

const addUser = ({ id, name, room }) => {
  name = name.trim().toLowerCase();
  room = room.trim().toLowerCase();

  //check if a user with the same name already exists in the room
  const existingUser = users.find(
    user => user.room === room && user.name === name
  );

  //if true, exit the function and return an error
  if (existingUser) {
    return { error: "Username is taken" };
  }

  // else make a 'user' object and push it into the 'users' array
  const user = { id, name, room };
  users.push(user);

  return { user };
};

const removeUser = id => {
  const index = users.findIndex(user => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

const getUser = id => {
  return users.find(user => user.id === id);
};

const getUsersInRoom = room => {
  return users.filter(user => user.room === room);
};

module.exports = { addUser, removeUser, getUser, getUsersInRoom };
