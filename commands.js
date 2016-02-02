var SplatnetScraper = require('./splatoon/scraper-main'),
    async = require('async'),
    Permit = require('./security/permit');
var splatnet = new SplatnetScraper();

var server = {
  default: {
    cooldown: 600,
    help: '',
    script: function(bot, message, args) {
      bot.sendMessage(message.channel, 'server.default stub');
    },
  },
  owner: {
    cooldown: 600,
    help: 'the name of the owner of the server',
    script: function(bot, message, args) {
      bot.sendMessage(message.channel, message.channel.server.owner.name);
    },
  },
  info: {
    cooldown: 600,
    help: 'some server stats',
    script: function(bot, message, args) {
      var server = message.channel.server;
      var info = '';
      info += '__**' + server.name + '**__\n';
      info += 'id: ' + server.id + '\n';
      info += 'members: ' + server.members.length + '\n';
      info += 'channels: ' + server.channels.length + '\n';
      info += 'region: ' + server.region + '\n';
      info += 'icon: ' + server.iconURL + '\n';

      bot.sendMessage(message.channel, info);
    },
  },
};

var channel = {
  default: {
    cooldwon: 600,
    help: '',
    script: function(bot, message, args) {
      bot.sendMessage(message.channel, 'channel default stub function');
    },
  },
  info: {
    cooldown: 600,
    help: '',
    script: function(bot, message, args) {
      var channel = message.channel;
      var info = '';
      info += '__**' + channel.name + '**__\n';
      info += 'id: ' + channel.id + '\n';

      bot.sendMessage(message.channel, info);
    },
  },
}

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
    server: {
      cooldown: 600,
      help: 'server specific commands',
      script: function(bot, message, args) {
        if (args[0]) {
          server[args[0]].script(bot, message, args);
        } else {
          server.default.script(bot, message, args);
        }
      },
    },
    channel: {
      cooldown: 600,
      help: 'server specific commands',
      script: function(bot, message, args) {
        if (args[0]) {
          channel[args[0]].script(bot, message, args);
        } else {
          channel.default.script(bot, message, args);
        }
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
        splatnet.getSchedule(function(err, newMess) {
          bot.sendMessage(message.channel, newMess);
        });
      },
    },
    selky: {
      cooldown: 600,
      help: 'what a selky is',
      script: function(bot, message, args) {
        bot.sendMessage(message.channel, 'Is quiet and oblivious, and sometimes very hilarious without even trying to be. ' +
          'She hates being seen as cute and enjoy watching other people cry, for science of course. ' +
          "She's very hard working when it comes to the things she's passionate about.");
      },
    },
    invite: {
      cooldown: 600,
      help: 'make the bot join another discord server',
      script: function(bot, message, args) {
        console.log('got invite to ' + args[0]);
        bot.joinServer(args[0], function(error, server) {
          if(error){
              bot.sendMessage(message.channel, "Failed to join: " + error);
          } else {
              bot.sendMessage(message.channel, "Joined " + server);
          }
        });
      }
    },

    permit: {
      cooldown: 600,
      help: 'permit bot to speak in this channel',
      userGroups: ['owner', 'creator'],
      script: Permit.permit,
    },
    forbid: {
      cooldown: 600,
      help: 'prevent bot from speaking in this channel',
      userGroups: ['owner', 'creator'],
      script: Permit.forbid,
    },
  },

  parse: function parseCommand(messageContent) {
    var args = messageContent.slice(1).split(' ');
    return {
      command: args[0].toLowerCase(),
      arguments: args.slice(1),
    }
  },
};

module.exports = commands;
