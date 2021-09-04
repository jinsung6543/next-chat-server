const users = [];

const addUser = ({ id, name, room }) => {
  name = name.trim().toLowerCase();
  room = room.trim().toLowerCase();

  const existingUser = users.find(
    (user) => user.room === room && user.name === name && user.id === id
  );

  if (existingUser) {
    return { error: 'Username is taken' };
  }

  const user = { id, name, room };

  users.push(user);

  return { user };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

const getUser = (id) => users.find((user) => user.id === id);

const getUsersInRoom = (room) => users.filter((user) => user.room === room);

const getOtherUsersInRoom = (id, room) => {
  console.log('current user: ', id);
  const result = users.filter((user) => user.room === room && user.id !== id);
  console.log('otherUsers: ', result);
  return result;
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
  getOtherUsersInRoom,
};
