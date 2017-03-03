// Dependencies
const http = require('http'),
	express = require('express'),
	crypto = require('crypto')
	socketio = require('socket.io');

// Server Setup
//const ipAddress = "192.168.2.10";
const App = express();
const Server = http.createServer(App);
const io = socketio(Server);
App.set('views', './views');
App.use(express.static('public'));
let clientsOnline = 0;
let hash = crypto.createHmac('sha256', testIPs[0])
	.update("Can't find me now")
	.digest('hex');

class Client {
	constructor(client) {
		this.id = client.id;
		this.ip = client.request.connection.remoteAddress;
		let hash = crypto.createHmac('sha256', this.ip)
			.update("Can't find me now")
			.digest('hex');
		this.color = "#" + hash.slice(0, 6);
		this.uniqueid = "user_" + hash.slice(0, 6);
	}
}
// Sockets
io.on('connection', (client) => {
	let currentClient = new Client(client);
	io.to(currentClient.id).emit('css', `
		#${currentClient.uniqueid} {
			font-style: italic;
		}
	`);
	console.log("Client connected at", currentClient.ip);
	clientsOnline++;
	console.log("Currently online:", clientsOnline);

	client.on('message', (data) => {
		console.log(data);
		data = data.replace(/</g, "&lt;").replace(/>/g, "&gt;");
		html = `
			<div><p id='${currentClient.uniqueid}' style='color: ${currentClient.color};'>${data}</p></div>
		`;
		io.sockets.emit('broadcast', html);
	});

	client.on('disconnect', () => {
		console.log("Client disconnected at", currentClient.ip);
		clientsOnline--;
		console.log("Currently online:", clientsOnline);
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
