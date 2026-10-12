const socket = io();
let myRoom = '';

function createRoom() {
    socket.emit('createRoom');
}

function joinRoom() {
    const code = document.getElementById('roomCodeInput').value;
    socket.emit('joinRoom', code);
}

function play(choice) {
    socket.emit('makeMove', { roomCode: myRoom, choice: choice });
    document.getElementById('status').innerText = `You picked ${choice}. Waiting for opponent...`;
}

// Game Master talking back to us:
socket.on('roomCreated', (code) => {
    myRoom = code;
    document.getElementById('menu').style.display = 'none';
    document.getElementById('game').style.display = 'block';
    document.getElementById('roomDisplay').innerText = `Your Lobby Code: ${code} (Tell your friend!)`;
});

socket.on('joinedRoom', (code) => {
    myRoom = code;
    document.getElementById('menu').style.display = 'none';
    document.getElementById('game').style.display = 'block';
});

socket.on('gameStart', (msg) => {
    document.getElementById('status').innerText = msg;
});

socket.on('result', (msg) => {
    document.getElementById('status').innerText = msg;
});

socket.on('errorMsg', (msg) => {
    alert(msg);
});