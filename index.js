const express = require('express');
const app = express();

const server = require('http').createServer(app);
const io = require('socket.io').listen(server);

app.set('port', process.env.PORT || 3000);

let clients = [];

io.on("connection", (socket) => {
  console.log("socket get");
  let currentUser;
  socket.on("USER_CONNECT", () => {
    console.log("User Connected");
    for (let client of clients) {
      socket.emit("USER_CONNECTED", {
        name: client.name,
        position: client.name
      });
      console.log(`User name ${client.name} is connected`);
    }
  });

  socket.on('PLAY', (data) => {
    console.log(data);
    currentUser = {
      name: data.name,
      position: data.position
    }

    clients.push(currentUser);
    socket.emit("PLAY", currentUser);
    socket.broadcast.emit("USER_CONNECTED", currentUser);
  });

  socket.on("MOVE", (data) => {
    currentUser.position = data.position;
    socket.emit("MOVE", currentUser);
    console.log(`${currentUser.name} move to ${currentUser.position}`);
  });

  socket.on("disconnect", () => {
    socket.broadcast.emit("USER_DISCONNECTED", currentUser);
    for (let i in clients) {
      if (clients[i].name === currentUser.name) {
        console.log(`User ${clients[i].name} disconnected`);
        clients.splice(i, 1);
      }
    }
  })
});



server.listen(app.get('port'), () => {
  console.log(`Listening on *:${app.get('port')}`);
});