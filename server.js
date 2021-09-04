const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const cors = require('cors');

const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
  getOtherUsersInRoom,
} = require('./users.js');

const PORT = process.env.PORT || 5000;

const router = require('./router');

const app = express();
app.use(cors());
app.use(router);

const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: '*',
  },
});

io.on('connection', (socket) => {
  socket.on('join', ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room });

    if (error) return callback(error);

    socket.emit('message', {
      user: 'admin',
      text: `${user.name}, welcome to the room: ${user.room}.`,
    });
    socket.broadcast
      .to(user.room)
      .emit('message', { user: 'admin', text: `${user.name}, has joined!` });

    socket.join(user.room);

    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    socket.emit('connectToOthers', {
      otherUsers: getOtherUsersInRoom(user.id, user.room),
    });

    callback();
  });

  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id);

    io.to(user.room).emit('message', { user: user.name, text: message });
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room),
    });

    callback();
  });

  socket.on('sendSignal', (payload) => {
    io.to(payload.userToSignal).emit('userJoined', {
      signal: payload.signal,
      callerID: payload.callerID,
    });
  });

  socket.on('returnSignal', (payload) => {
    io.to(payload.callerID).emit('receivedSignal', {
      signal: payload.signal,
      id: socket.id,
    });
  });

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if (user) {
      socket.broadcast.emit('userLeft', socket.id);
      io.to(user.room).emit('message', {
        user: 'admin',
        text: `${user.name} has left.`,
      });

      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
