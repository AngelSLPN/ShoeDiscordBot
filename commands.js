var SplatnetScraper = require('./splatnet-scraper/scraper-main'),
    async = require('async');
var splatnet = new SplatnetScraper();
var commands = {
  list: {
    help: {
      cooldown: 0,
      help: 'call this command to get help',
      script: function(bot, message, args) {
        if (args[0]) {
          bot.sendMessage(message.channel, commands.list[args[0]].help);
        } else {
          //list commands
          bot.sendMessage(message.channel, Object.keys(commands.list).toString());
        }
      },
    },
    servers: {
      cooldown: 600,
      help: 'a list of servers this bot is in',
      script: function(bot, message, args) {
        bot.sendMessage(message.channel, bot.servers);
      },
    },
    channels: {
      cooldown: 600,
      help: 'a list of channels this bot is in',
      script: function(bot, message, args) {
        bot.sendMessage(message.channel, bot.channels);
      },
    },
    schedule: {
      cooldown: 600,
      help: 'upcoming map rotations in splatoon',
      script: function(bot, message, args) {
        async.series([
          splatnet.login,
          splatnet.getSchedule.bind(splatnet),
        ], function(err, results) {
          if (results) {
            bot.sendMessage(message.channel, results[1]);
          }
        });
      },
    },
    ranked: {
      cooldown: 600,
      help: 'test command to get ranks',
      script: function(bot, message, args) {
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
    selky: {
      cooldown: 600,
      help: 'what a selky is',
      script: function(bot, message, args) {
        bot.sendMessage(message.channel, 'ìßully');
      },
    }
  },
  parse: function parseCommand(messageContent) {
    var args = messageContent.slice(1).split(' ');
    return {
      command: args[0],
      arguments: args.slice(1),
    }
  },
}

module.exports = commands;
