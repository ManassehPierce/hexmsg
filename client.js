const socketio = require('socket.io-client'),
	colors = require('colors'),
	util = require('util');

var io = socketio('http://hexmsg.herokuapp.com/');
var userid;
process.stdin.resume();
process.stdin.setEncoding('utf8');

function message(msg) {
	io.emit('message', msg, (res) => {
		console.log("Response:", res);
	});
}

function getHexValue(hex) {
	hex = hex.toLowerCase();
	let hexcodes = "0123456789abcdef";
	for (let i = 0; i < hexcodes.length; i++) {
		if (hex == hexcodes[i]) return i;
	}
}

class RGBcolor {
	constructor(color) {
		this.red = getHexValue(color[1]) + getHexValue(color[2]);
		this.blue = getHexValue(color[3]) + getHexValue(color[4]);
		this.green = getHexValue(color[5]) + getHexValue(color[6]);
	}
	returnColoredText(text) {
		if (this.red + this.green >= this.blue * 2) return colors.yellow(text);
		else if (this.red + this.blue >= this.green * 2) return colors.magenta(text);
		else if (this.green + this.blue >= this.red * 2) return colors.cyan(text);
		else if (this.red >= this.blue && this.red >= this.green) return colors.red(text);
		else if (this.blue >= this.red && this.blue >= this.green) return colors.blue(text);
		else if (this.green >= this.red && this.green >= this.blue) return colors.green(">" + text);
		else if (this.green < 32 && this.red < 32 && this.blue < 32) return colors.gray(text);
	}
}

io.on('connect', () => {
	process.stdin.on('data', (text) => {
		message(text);
	});
});

io.on('startup', (data) => {
	userid = data.userid;
})

io.on('broadcast', (data) => {
	let color = new RGBcolor(data.color);
	if (userid != data.clientid) console.log(color.returnColoredText(data.text.replace(/&lt;/g, "<").replace(/&gt;/g, ">")));
});
