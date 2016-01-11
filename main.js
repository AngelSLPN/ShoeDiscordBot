var Discord = require('discord.js'),
    async = require('async'),
    auth = require('./auth.json'),
    SplatnetScraper = require('./splatnet-scraper/scraper-main');

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
  if (message.content === 'ping') {
    mybot.reply(message, 'pong');
  }
  if (message.content === '<<schedule') {
    var splatnet = new SplatnetScraper();
    async.series([
      splatnet.login,
      splatnet.getSchedule.bind(splatnet),
    ], function(err, results) {
      if (results) {
        mybot.sendMessage(message.channel, results[1]);
      }
    });
  }
});

mybot.login('hhhhsu@yahoo.com', 'ibAndroid4389Bot');
