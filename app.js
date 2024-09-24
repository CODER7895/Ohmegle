const express = require('express');
const app = express();
const socket = require('socket.io');
const http = require('http');
const path = require('path');
const indexRoute = require('./routes/index-route')

const server = http.createServer(app);
const io = socket(server);

let waitingUsers = [];
let rooms = {};
io.on('connection', (socket) => {
    socket.on('joinroom', () => {
        if (waitingUsers.length > 0) {
            let partner = waitingUsers.shift();
            const roomname = `${socket.id}-${partner.id}`;

            socket.join(roomname);
            partner.join(roomname);

            io.to(roomname).emit('joined', roomname);
        } else {
            waitingUsers.push(socket);
        }
    });

    socket.on('signalingMessage', (data) => {
        socket.to(data.room).emit('signalingMessage', data.message);
    });

    socket.on('startVideoCall', ({ room }) => {
        socket.to(room).emit('incomingCall');
    });

    socket.on('message', (data) => {
        // Broadcast to others in the room except the sender
        socket.to(data.room).emit('message', data.message);
    });

    socket.on('acceptCall', ({ room }) => {
        socket.to(room).emit("callAccepted");
    });

    socket.on('disconnect', () => {
        let index = waitingUsers.findIndex((user) => user.id === socket.id);
        if (index !== -1) waitingUsers.splice(index, 1);
    });
});


app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use('/', indexRoute);

server.listen(process.env.PORT || 3000);