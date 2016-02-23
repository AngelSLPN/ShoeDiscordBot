var SplatnetScraper = require('./splatoon/scraper-main'),
    async = require('async'),
    Permit = require('./security/permit');
var splatnet = new SplatnetScraper();

var command = {
  hasArgs: function(args) {
    return args.length > 0;
  },
};

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

var user = {
  default: {
    cooldown: 600,
    help: '',
    script: function(bot, message, args) {

    },
  },

  info: {
    cooldown: 600,
    help: '',
    script: function(bot, message, args) {
      var userObj;
      var text;
      if (command.hasArgs(args)) {
        var username = args.join(' ');
        users = message.client.users.getAll('username', username);
        if (users.length < 1) {
          bot.sendMessage(message.channel, 'user not found');
          return;
        }
        var texts = users.map(function(use) {
          return user.info.getText(message, use);
        });
        text = texts.join('\n');
      } else {
        userObj = message.author;
        text = user.info.getText(message, userObj)
      }

      bot.sendMessage(message.channel, text);
    },

    getText: function(message, user) {
      var info = '';
      info += '__**' + user.username + '**__\n';
      info += 'discriminator: ' + user.discriminator + '\n';
      info += 'id: ' + user.id + '\n';
      info += 'status: ' + user.status + '\n';
      info += 'avatarURL: ' + user.avatarURL + '\n';

      if (message.channel.server) {
        var details = message.channel.server.detailsOfUser(user);
        if (details) {
          var rolesText = '';
          if (details.roles.length > 0) {
            details.roles.map(function(role) {
              rolesText += role.name + ', ';
            });
            rolesText = rolesText.slice(0, -2);
          } else {
            rolesText += 'none';
          }

          info += 'roles: ' +  rolesText + '\n';

          info += 'joined server: ' + (new Date(details.joinedAt)).toString();
        }
      }
      return info;
    },
  },
}

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

    user: {
      cooldown: 600,
      help: 'user commands',
      script: function(bot, message, args) {
        if (args[0]) {
          if (user[args[0]]) {
            user[args[0]].script(bot, message, args.slice(1));
          } else {
            bot.sendMessage(message.channel, 'there is no user command: ' + args[0]);
          }
        } else {
          user.default.script(bot, message, args);
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
          if (server[args[0]]) {
            server[args[0]].script(bot, message, args.slice(1));
          } else {
            bot.sendMessage(message.channel, 'command not supported');
          }
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
