// Dependencies
const http = require('http'),
	express = require('express'),
	crypto = require('crypto')
	socketio = require('socket.io');

// Server Setup
const ipAddress = "localhost";//"192.168.137.1";
const App = express();
const Server = http.createServer(App);
const io = socketio(Server);
App.set('views', './views');
App.use(express.static('public'));
let clientsOnline = 0;
let testIPs = ["124.752.631.4"];
let hash = crypto.createHmac('sha256', testIPs[0])
	.update("Can't find me now")
	.digest('hex');
console.log(hash);
// Add a view engine later

// Sockets
io.on('connection', (client) => {
	console.log("Client connected!", client.request.connection.remoteAddress);
	clientsOnline++;
	console.log("Currently online:", clientsOnline);

	client.on('message', (data) => {
		console.log(data);//client.request.connection.remoteAddress;
		data = data.replace(/</g, "&lt;").replace(/>/g, "&gt;");
		let hash = crypto.createHmac('sha256', testIPs[0])
			.update("Can't find me now")
			.digest('hex');
		color = "#" + hash.slice(0, 6);
		html = `
			<div><p style='color: ${color};'>${data}</p></div>
		`;
		io.sockets.emit('broadcast', html);
	});

	client.on('disconnect', () => {
		console.log("Client disconnected!");
		clientsOnline--;
		console.log("Currently online:", clientsOnline);
	});

});

// Routes
App.get('/', (req, res) => {
	res.sendFile(__dirname + "/views/socket.html");
});

// Server Listener
Server.listen(8000, ipAddress, () => {
	console.log("Server is running");
});
