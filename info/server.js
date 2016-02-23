var command = require('../command-utilities');

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
      var serverObj;
      if (command.hasArgs(args)) {
        serverName = args.join(' ');
        servers = message.client.servers.getAll('name', serverName);
        if (servers.length < 1) {
          bot.sendMessage(message.channel, serverName + ' not found');
          return;
        }
        serverObj = servers[0];
      } else {
        serverObj = message.channel.server;
      }

      bot.sendMessage(message.channel, server.info.getText(serverObj));
    },

    getText: function(server) {
      var info = '';
      info += '__**' + server.name + '**__\n';
      info += 'id: ' + server.id + '\n';
      info += 'members: ' + server.members.length + '\n';
      info += 'channels: ' + server.channels.length + '\n';
      info += 'region: ' + server.region + '\n';
      info += 'icon: ' + server.iconURL + '\n';

      return info;
    }
  },

  channels: {
    cooldown: 600,
    help: 'list of channels',
    script: function(bot, message, args) {
      var textChannels = [],
          voiceChannels = [];

      message.channel.server.channels.map(function(channel) {
        if (channel.type == 'voice') {
          voiceChannels.push(channel);
        } else if (channel.type == 'text') {
          textChannels.push(channel);
        }
      });

      var channels = '';
      channels += '__**Text**__\n';
      textChannels.map(function(channel) {
        channels += channel.toString() + '\n';
      });

      channels += '\n__**Voice**__\n';
      voiceChannels.map(function(channel) {
        channels += channel.mention() + '\n';
      });

      bot.sendMessage(message.channel, channels);
    },
  },
};

module.exports = server;
