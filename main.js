var Discord = require('discord.js'),
    auth = require('./auth.json'),
    commands = require('./commands'),
    settings = require('./settings.json'),
    db = require('./db');

//start web server
require('./web-server');

var mybot = new Discord.Client();

//when the bot is ready
mybot.on("ready", function () {
	console.log("Ready to begin! Serving in " + mybot.channels.length + " channels");
});

//when the bot disconnects
mybot.on("disconnected", function () {
	//alert the console
	console.log("Disconnected!");

	//exit node.js with an error
	process.exit(1);
});

mybot.on('message', function(message) {
  if (message.content.startsWith(settings.prefix)) {
    var parsed = commands.parse(message.content);
    if (commands.list.hasOwnProperty(parsed.command)) {
      commands.list[parsed.command].script(mybot, message, parsed.arguments);
    } else {
      mybot.sendMessage(message.channel, '"' + parsed.command + '" command not supported');
    }
  }
});

mybot.login(auth.discord.email, auth.discord.password);
