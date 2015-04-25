var config = {
	ip: "192.168.1.101",
	port: 8080,
	channels: ["#gameinaday"],
	server: "irc.maxgaming.net",
	username: "noolirc"
};

var http = require('http');
var irc = require("irc");
var fs = require('fs');
var url = require('url');
var mainPage = fs.readFileSync('index.html');
var messages = [];

// Create the bot name
var bot = new irc.Client(config.server, config.username, {
	channels: config.channels
});

bot.addListener("join", function(channel, who) {
	// Welcome them in!
	//bot.say(channel, who + "...dude...welcome back!");
});

// Listen for any message, PM said user when he posts
bot.addListener("message", function(from, to, text, message) {
	//bot.say(from, "This is a repsonse to a private message");
});

// Listen for any message, say to him/her in the room
bot.addListener("message", function(inFrom, inTo, inText, inMessage) {
	var d = new Date();
	var message = {
		date: d,
		from: inFrom,
		to: inTo,
		text: inText,
		message: inMessage
	};
	messages.push(message);

	//bot.say(config.channels[0], "This is a response to a channel message");
});

var http = require('http');
http.createServer(function (req, res) {
	var requestDetails = url.parse(req.url, true);

	if(requestDetails.pathname == "/") {
		console.log("accessed root");
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.end(mainPage);
	}
	
	if(requestDetails.pathname == "/getAllMessages") {
		console.log("/getAllMessages called.");
		res.writeHead(200, {'Content-Type': 'application/json'});
		res.end(JSON.stringify(messages));	
	}

	if(requestDetails.pathname == "/getMessages") {
		res.writeHead(200, {'Content-Type': 'application/json'});
		var messagesToSend = [];
		
		for(var c=requestDetails.query.startIndex;c<messages.length;c++) {
			messagesToSend.push(messages[c]);
		}
		
		res.end(JSON.stringify(messagesToSend));
	}
	
	if(requestDetails.pathname == "/sendMessage") {
		console.log("/sendMessage called: " + requestDetails.query.message);
		res.writeHead(200, {'Content-Type': 'text/plain'});
		bot.say(config.channels[0], requestDetails.query.message);
		res.end(requestDetails.query.message);

		var d = new Date();
		var message = {
			date: d,
			from: config.username,
			to: config.channels[0],
			text: requestDetails.query.message,
			message: requestDetails.query.message
		};
		messages.push(message);
	}

}).listen(config.port, config.ip);

console.log("Server running at http://" + config.ip + ":" + config.port + "/");
