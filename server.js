const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static(__dirname)); // Serves the game files

let rooms = {}; // Keeps track of all the secret lobbies

io.on('connection', (socket) => {
    console.log('A new player arrived!');

    // When someone makes a new lobby
    socket.on('createRoom', () => {
        const roomCode = Math.random().toString(36).substring(2, 6).toUpperCase(); // Makes a random 4-letter code
        rooms[roomCode] = { players: [socket.id], choices: {} };
        socket.join(roomCode);
        socket.emit('roomCreated', roomCode);
    });

    // When someone uses a code to join
    socket.on('joinRoom', (roomCode) => {
        if (rooms[roomCode] && rooms[roomCode].players.length < 2) {
            rooms[roomCode].players.push(socket.id);
            socket.join(roomCode);
            socket.emit('joinedRoom', roomCode);
            io.to(roomCode).emit('gameStart', 'Both players are here! Make your move!');
        } else {
            socket.emit('errorMsg', 'Room is full or does not exist!');
        }
    });

    // When someone picks Rock, Paper, or Scissors
    socket.on('makeMove', (data) => {
        const { roomCode, choice } = data;
        if (rooms[roomCode]) {
            rooms[roomCode].choices[socket.id] = choice;
            
            // If both players have picked, see who won!
            if (Object.keys(rooms[roomCode].choices).length === 2) {
                const players = rooms[roomCode].players;
                const choice1 = rooms[roomCode].choices[players[0]];
                const choice2 = rooms[roomCode].choices[players[1]];
                
                io.to(roomCode).emit('result', `Player 1 picked ${choice1}, Player 2 picked ${choice2}!`);
                rooms[roomCode].choices = {}; // Reset for the next round
            }
        }
    });
});

http.listen(3000, () => {
    console.log('Game Master is listening on port 3000');
});