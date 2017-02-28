// Dependencies
const http = require('http'),
	express = require('express'),
	socketio = require('socket.io');

// Server Setup
const App = express();
const Server = http.createServer(App);
const io = socketio(Server);

// Sockets
io.on('connection', () => {
	// Do stuff
});

// Routes
App.get('/', (req, res) => {
	res.send("Hello world");
});

// Server Listener
Server.listen(8000, () => {
	console.log("Server is running");
});
