var command = require('../command-utilities');
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
          message.channel.sendMessage('user not found');
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

      message.channel.sendMessage(text);
    },

    getText: function(message, user) {
      var info = '';
      info += '__**' + user.username + '**__\n';
      info += 'discriminator: ' + user.discriminator + '\n';
      info += 'id: ' + user.id + '\n';
      info += 'status: ' + user.status + '\n';
      info += 'avatarURL: ' + user.avatarURL + '\n';

      if (message.channel.guild) {
        var details = message.channel.guild.fetchMember(user);
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
};

module.exports = user;
