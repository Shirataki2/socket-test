const express = require('express');
const cors = require('cors');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);

app.set('port', process.env.PORT || 3000);
//app.use(cors());

let clients = {
    "DUMMY": "##NULL##"
}


const genB64String = (length = 64) => {
    const c = 'QWERTYUIOPASDFGHJKLZXCVBNM1234567890qwertyuiopasdfghjklzxcvbnm/=';
    let s = '';
    for (let _ in [...Array(length)]) {
        s += c[Math.floor(Math.random() * c.length)];
    }
    return s;
}

io.on('connect', (socket) => {
    console.log('User Connected!');
    let currentUser;
    socket.on('USER_CONNECTED', () => {
        let n = String(Object.keys(clients).length - 1);
        socket.emit('USER_CONNECTED', n);
    });

    socket.on('disconnect', (data) => {
        console.log(data)
        console.log('User Disconnected!');
    });

    socket.on("OTHER_USER_ROOM_IN", () => {
        Object.keys(clients).forEach((key) => {
            if (key !== "DUMMY" && key !== currentUser.id) {
                console.log(key);
                socket.emit("OTHER_USER_ROOM_IN", clients[key]);
            }
        });
    });

    socket.on('LOGIN', () => {
        console.log('User Login!');
        socket.emit('LOGIN');
    });

    socket.on('ROOM_IN', (data) => {
        data = JSON.parse(data);
        const _id = genB64String();
        console.log(`${data.name}(id: ${_id}) Room in!`);
        data.id = _id;
        clients[_id] = data;
        console.log(`Online Number: ${Object.keys(clients - 1).length}`);
        currentUser = data;
        socket.emit("ROOM_IN", currentUser);
        socket.broadcast.emit("OTHER_USER_ROOM_IN", currentUser);
    });

    socket.on("UPD8", (data) => {
        data = JSON.parse(data);
        currentUser = data;
        socket.broadcast.emit("UPD8", currentUser);
    });

    socket.on("CLOSE", (data) => {
        console.log("Delete: " + data);
        delete clients[data];
    });
});



server.listen(app.get('port'), () => {
    console.log(`Listening on *:${app.get('port')}`);
});