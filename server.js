// Dependencies
const http = require('http'),
	express = require('express'),
	crypto = require('crypto')
	socketio = require('socket.io');

// Server Setup
//const ipAddress = "192.168.2.10";
let port = process.env.PORT || 8000; // Using Heroku's port if available, if not, use 8000
// Move JS to external file, minified
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
	// Sending the client it's css code and userid on join
	io.to(currentClient.id).emit('startup', {userid: currentClient.uniqueid});
	console.log("Client connected at", currentClient.ip);
	clientsOnline++; // Incrementing users online upon a connection

	client.on('message', (data) => {
		if (data.length < 1000 && data.length >= 1) { // Ensuring that messages aren't too long for the server to handle
			data = data.replace(/</g, "&lt;").replace(/>/g, "&gt;").toLowerCase(); // Escaping html characters to prevent xss and other nasty things
			text = `${data}`; // The html to be injected into the client's page
			io.sockets.emit('broadcast', {"text": text, "clientid": currentClient.uniqueid, "color": currentClient.color}); // Sending the html to the client
		} else {
			io.to(currentClient.id).emit('client_error', "Messages need to be between 1 - 1000 characters!"); // Throwing an error if the message is over 1000 characters
		}
	});

	client.on('disconnect', () => {
		console.log("Client disconnected at", currentClient.ip);
		clientsOnline--; // Decrementing users online upon a user leaving
	});

	client.on('test', (data, res) => {
		res("You just sent: " + data);
	});

});

// Routes
App.get('/', (req, res) => {
	res.sendFile(__dirname + "/views/socket.html"); // Sending the html file when the website's root is visited
});

App.get('/hexmsg', (req, res) => {
	res.sendFile(__dirname + "/views/hexmsg.html");
});

// Server Listener
Server.listen(port, () => {
	console.log("Server is running...");
});

// Ping the Dyno to keep it from sleeping
setInterval(() => {
	http.get("http://hexmsg.herokuapp.com");
}, 300000);
