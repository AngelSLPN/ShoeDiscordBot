var command = require('../command-utilities'),
    ytdl = require('ytdl-core');

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

  youtube: {
    cooldown: 600,
    help: 'play a youtube link',
    script: function(bot, message, args) {
      var video = ytdl(
        'http://www.youtube.com/watch?v=oaxUPPdXkaI',
        {
          filter: 'audioonly',
          quality: 'lowest',
        }
      );

      video.on('response', function() {
        /*if (err) {
          console.log(err);
          return;
        }*/
        console.log('response');
      });

      video.on('error', function() {
        console.log('error');
      });

      bot.voiceConnection.playRawStream(
        video,
        {
          volume: 0.25
        },
        function(err, intent) {
          if (err) {
            console.log(err);
            return;
          }
          console.log('started');
          intent.on('end', function() {console.log('end')});
        }
      );
      console.log('youtube');
    },
  },
};

module.exports = music;
