var command = require('../command-utilities'),
    ytdl = require('ytdl-core'),
    youtube = require('./youtube'),
    Queue = require('./queue');

var queue;

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
          queue = new Queue(connection);
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

  youtube: {
    cooldown: 600,
    help: 'play a youtube link',
    script: function(bot, message, args) {
      if (!command.hasArgs(args)) {
        return;
      }
      youtube(args[0], function(err, song) {
        queue.addSong(song);
      });
    },
  },

  skip: {
    cooldown: 0,
    help: 'skip current song',
    script: function(bot, message, args) {
      queue.skip();
    },
  },

  stop: {
    cooldown: 0,
    help: 'stop playing and empty queue',
    script: function(bot, message, args) {
      queue.stop();
    },
  },

  pause: {
    cooldown: 0,
    help: 'pause playing',
    script: function(bot, message, args) {
      queue.stop();
    },
  },

  list: {
    cooldown: 0,
    help: 'list songs in queue',
    script: function(bot, message, args) {
      var list = queue.list();
      bot.sendMessage(message.channel, list);
    }
  }
};

module.exports = music;
