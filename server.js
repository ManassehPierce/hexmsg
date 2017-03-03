// Dependencies
const http = require('http'),
	express = require('express'),
	crypto = require('crypto')
	socketio = require('socket.io');

// Server Setup
//const ipAddress = "192.168.2.10";
let port = process.env.PORT || 8000; // Using Heroku's port if available, if not, use 8000
const App = express();
const Server = http.createServer(App);
const io = socketio(Server);
App.set('views', './views');
App.use(express.static('public'));
let clientsOnline = 0; // A variable to keep track of how many users are online

class Client { // The Client class
	constructor(client) {
		this.id = client.id; // The id assigned by the websocket, used to send messages to a specific client rather than the whole server
		this.ip = client.request.connection.remoteAddress; // Setting the ip to the Client class
		let hash = crypto.createHmac('sha256', this.ip)
			.update(process.env.hashingSecret)
			.digest('hex'); // Hashing the ip to make a random string of characters in base16
		this.color = "#" + hash.slice(0, 6); // Using the hash of characters to make a hexadecimal color
		this.uniqueid = "user_" + hash.slice(0, 6); // Making an id for the users to track which messages are theirs
	}
}

// Sockets
io.on('connection', (client) => {
	let currentClient = new Client(client); // Making an instance of the Client class
	io.to(currentClient.id).emit('css', `
		#${currentClient.uniqueid} {
			font-style: italic;
		}
	`);
	console.log("Client connected at", currentClient.ip);
	clientsOnline++; // Incrementing users online upon a connection

	client.on('message', (data) => {
		if (data.length < 1000) { // Ensuring that messages aren't too long for the server to handle
			data = data.replace(/</g, "&lt;").replace(/>/g, "&gt;").toLowerCase(); // Escaping html characters to prevent xss and other nasty things
			html = `
				<div><p id='${currentClient.uniqueid}' style='color: ${currentClient.color};'>${data}</p></div>
			`; // The html to be injected into the client's page
			io.sockets.emit('broadcast', html); // Sending the html to the client
		} else {
			io.to(currentClient.id).emit('client_error', "Message too long, please use < 1000 characters!"); // Throwing an error if the message is over 1000 characters
		}
	});

	client.on('disconnect', () => {
		console.log("Client disconnected at", currentClient.ip);
		clientsOnline--; // Decrementing users online upon a user leaving
	});

});

// Routes
App.get('/', (req, res) => {
	res.sendFile(__dirname + "/views/socket.html"); // Sending the html file when the website's root is visited
});

// Server Listener
Server.listen(port, () => {
	console.log("Server is running...");
});

// Ping the Dyno to keep it from sleeping
setInterval(() => {
	http.get("http://hexmsg.herokuapp.com");
}, 300000);
