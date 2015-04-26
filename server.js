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

bot.addListener("join", function(inChannel, inNick, inMessage) {
	var d = new Date();
	var message = {
		type: "join",
		date: d,
		channel: inChannel,
		nick: inNick,
		message: inMessage,
	};
	messages.push(message);
});

bot.addListener("part", function(inChannel, inNick, inMessage) {
	var d = new Date();
	var message = {
		type: "part",
		date: d,
		channel: inChannel,
		nick: inNick,
		message: inMessage,
	};
	messages.push(message);
});

bot.addListener("quit", function(inNick, inReason, inChannel, inMessage) {
	var d = new Date();
	var message = {
		type: "quit",
		date: d,
		nick: inNick,
		reason: inReason,
		channel: inChannel,
		message: inMessage,
	};
	messages.push(message);
});

bot.addListener("kick", function(inChannels, inNick, inBy, inReason, inMessage) {
	var d = new Date();
	var message = {
		type: "kick",
		date: d,
		channels: inChannels,
		nick: inNick,
		by: inBy,
		reason: inReason,
		message: inMessage,
	};
	messages.push(message);
});

bot.addListener("kill", function(inNick, inReason, inChannels, inMessage) {
	var d = new Date();
	var message = {
		type: "kill",
		date: d,
		nick: inNick,
		reason: inReason,
		channels: inChannels,
		message: inMessage,
	};
	messages.push(message);
});

bot.addListener("message", function(inFrom, inTo, inText, inMessage) {
	var d = new Date();
	var message = {
		type: "message",
		date: d,
		from: inFrom,
		to: inTo,
		text: inText,
		message: inMessage
	};
	messages.push(message);

	//bot.say(config.channels[0], "This is a response to a channel message");
});


bot.addListener("nick", function(inOldNick, inNewNick, inChannels, inMessage) {
	var d = new Date();
	var message = {
		type: "nick",
		date: d,
		from: inFrom,
		oldNick: inOldNick,
		newNick: inNewNick,
		channels: inChannels,
		message: inMessage
	};
	messages.push(message);

	//bot.say(config.channels[0], "This is a response to a channel message");
});

bot.addListener("action", function(inFrom, inTo, inText, inMessage) {
	var d = new Date();
	var message = {
		type: "action",
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
		console.log("/ called.");
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.end(mainPage);
	}

	if(requestDetails.pathname == "/getMessages") {
		console.log("/getMessages called.");
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
			type: "message",
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
