var command = require('../command-utilities');

var music = {
  default: {
    cooldown: 600,
    help: 'music bot commands',
    script: function(bot, message, args) {
      bot.sendMessage(message.channel, 'music bot commands');
    },
  },

  join: {
    cooldown: 600,
    help: 'join a voice channel',
    script: function(bot, message, args) {
      if (command.hasArgs(args)) {
        var channelName = args.join(' ');
        var channel = message.channel.server.channels.get('name', args[0]);
        if (!channel) {
          bot.sendMessage(message.channel, 'channel not found');
          return;
        }

        bot.joinVoiceChannel(channel, function(err, connection) {
          if (err) {
            console.log(err);
            return;
          }
        });
      }
    },
  },

  leave: {
    cooldown: 600,
    help: 'leave current voice channel',
    script: function(bot, message, args) {
      bot.leaveVoiceChannel(function(err, connection) {
        if (err) {
          console.log(err);
        }
      });
    },
  },
};

module.exports = music;
