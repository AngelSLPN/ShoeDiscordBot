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
      message.channel.sendMessage('music bot commands');
    },
  },

  join: {
    cooldown: 600,
    help: 'join a voice channel, if no channel is specified join the first channel',
    script: function(bot, message, args) {
      var channel;
      if (command.hasArgs(args)) {
        var channelName = args.join(' ');
        channel = message.channel.server.channels.get('name', args[0]);
        if (!channel) {
          message.channel.sendMessage(args[0] + ' channel not found');
          return;
        }
      } else {
        channel = message.channel.server.channels.get('type', 'voice');
        if (!channel) {
          message.channel.sendMessage('no voice channels found');
          return;
        }
      }

      bot.joinVoiceChannel(channel, function(err, connection) {
        if (err) {
          console.log(err);
          return;
        }
        queue = new Queue(connection);
      });
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
        queue = null;
      });
    },
  },

  location: {
    cooldown: 0,
    help: 'voice channel the dj is in',
    script: function(bot, message, args) {
      var mess;
      if (bot.voiceConnection) {
        mess = bot.voiceConnection.voiceChannel + ' on ' + bot.voiceConnection.voiceChannel.server
      } else {
        mess = 'bot is currently not in a channel';
      }
      message.channel.sendMessage(mess);
    }
  },

  youtube: {
    cooldown: 600,
    help: 'play a youtube link, if the link is not a url search on youtube and queue first song',
    script: function(bot, message, args) {
      if (!queue) {
        message.channel.sendMessage('bot is not in a voice channel');
        return;
      }
      if (!command.hasArgs(args)) {
        return;
      }
      if (command.argIsUrl(args[0])) {
        if (!youtube.isYtUrl(args[0])) {
          message.channel.sendMessage(args[0] + ' is not youtube url');
          return;
        }
        youtube.getSong(args[0], function(err, song) {
          if (err) {
            console.log(err);
            message.channel.sendMessage('error getting song');
          }

          var pos = queue.addSong(song);
          //delete the command cause youtube previews are huge
          bot.deleteMessage(message);
          message.channel.sendMessage('queued “' + song.title + '” at #' + pos);
        });
      } else {
        //search on youtube
        youtube.search(args.join(' ')).then(function(res) {
          youtube.getSong(res.url, function(err, song) {
            if (err) {
              console.log(err);
              message.channel.sendMessage('error getting song');
            }

            var pos = queue.addSong(song);
            message.channel.sendMessage('queued “' + res.title + '” at #' + pos);
          });
        }).catch(function(err) {
          console.log(err);
          message.channel.sendMessage('error finding song');
        });
      }
    },
  },

  search: {
    cooldown: 600,
    help: 'find a youtube video',
    script: function(bot, message, args) {
      //search on youtube
      youtube.search(args.join(' ')).then(function(res) {
        var mess = res.title + '\n' + res.url;
        message.channel.sendMessage(mess);
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
      message.channel.sendMessage(list);
    }
  }
};

music['play'] = music.youtube;

module.exports = music;
