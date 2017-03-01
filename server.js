// Dependencies
const http = require('http'),
	express = require('express'),
	socketio = require('socket.io');

// Server Setup
const App = express();
const Server = http.createServer(App);
const io = socketio(Server);
App.set('views', './views');
App.use(express.static('public'));
// Add a view engine later

// Sockets
io.on('connection', (client) => {
	console.log("Client connected!");

	client.on('join', (data) => {
		console.log(data);
	});

	client.on('message', (data) => {
		console.log(data);
	});

	client.on('disconnect', () => {
		console.log("Client disconnected!");
	});

});

// Routes
App.get('/', (req, res) => {
	res.sendFile(__dirname + "/views/socket.html");
});

// Server Listener
Server.listen(8000, () => {
	console.log("Server is running");
});
