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
let clientsOnline = 0;
// Add a view engine later

// Sockets
io.on('connection', (client) => {
	console.log("Client connected!");
	clientsOnline++;

	client.on('join', (data) => {
		console.log(data);
	});

	client.on('message', (data) => {
		console.log(data);
		io.sockets.emit('broadcast', data)
		// Send to dom here
	});

	client.on('disconnect', () => {
		console.log("Client disconnected!");
		clientsOnline--;
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
