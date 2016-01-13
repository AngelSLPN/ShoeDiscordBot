var Discord = require('discord.js'),
    async = require('async'),
    auth = require('./auth.json'),
    SplatnetScraper = require('./splatnet-scraper/scraper-main');

var mybot = new Discord.Client(),
    splatnet = new SplatnetScraper();

var commands = {
  help: {
    cooldown: 0,
    help: 'call this command to get help',
    script: function(message, args) {
      if (args[0]) {
        mybot.sendMessage(message.channel, commands[args[0]].help);
      } else {
        //list commands
        mybot.sendMessage(message.channel, Object.keys(commands).toString());
      }
    },
  },
  servers: {
    cooldown: 600,
    help: 'a list of servers this bot is in',
    script: function(message, args) {
      mybot.sendMessage(message.channel, mybot.servers);
    },
  },
  channels: {
    cooldown: 600,
    help: 'a list of channels this bot is in',
    script: function(message, args) {
      mybot.sendMessage(message.channel, mybot.channels);
    },
  },
  schedule: {
    cooldown: 600,
    help: 'upcoming map rotations in splatoon',
    script: function(message, args) {
      async.series([
        splatnet.login,
        splatnet.getSchedule.bind(splatnet),
      ], function(err, results) {
        if (results) {
          mybot.sendMessage(message.channel, results[1]);
        }
      });
    },
  },
  ranked: {
    cooldown: 600,
    help: 'test command to get ranks',
    script: function(message, args) {
      async.series([
        splatnet.login,
        splatnet.getRanked.bind(splatnet),
      ], function(err, results) {
        /*if (results) {
          mybot.sendMessage(message.channel, results[1]);
        }*/
      });
    },
  },
}

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
  if (message.content.startsWith('%')) {
    var parsed = parseCommand(message.content);
    if (commands.hasOwnProperty(parsed.command)) {
      commands[parsed.command].script(message, parsed.arguments);
    } else {
      mybot.sendMessage(message.channel, command + ' command not supported');
    }
  }
});

function parseCommand(messageContent) {
  var args = messageContent.slice(1).split(' ');
  return {
    command: args[0],
    arguments: args.slice(1),
  }
}

mybot.login(auth.discord.email, auth.discord.password);
