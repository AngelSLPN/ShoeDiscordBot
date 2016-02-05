var PermittedChannels = require('./permitted-channel-model'),
    commands = require('../commands'),
    settings = require('../settings.json');


function userPermitted(message, command) {
  if (commands.list[command].userGroups) {
    var permissions = commands.list[command].userGroups.map(function(group) {
      if (message.channel.isPrivate) {
        return group == 'PM';
      } else if (group == 'owner') {
        return message.channel.server.owner.id == message.author.id;
      } else if (group == 'creator') {
        return message.author.id = settings.creator;
      } else {
        return message.channel.server.rolesOfUser(message.author).indexOf(group) > -1;
      }
    });

    return permissions.indexOf(true) > -1;
  } else {
    return true;
  }
}

function checkPermit(message, command, callback) {
  //bot is always permitted to speak in private channels
  if (message.channel.isPrivate) {
    callback(null, true);
    return;
  }

  PermittedChannels.findOne({id: message.channel.id}, function(err, doc) {
    if (err) {
      callback(err, false);
      console.log(err);
      return;
    }

    var userPermit = userPermitted(message, command);

    //always allow the owner permission to permit bot to talk
    if (command == 'permit') {
      callback(null , userPermit);
    } else if (!doc) {
      callback(null, false);
    } else if (doc.forbiddenCommands.indexOf(command) > -1) {
      callback(null, false);
    } else if (doc.allPermitted) {
      callback(null, userPermit);
    } else if (doc.permittedCommands.indexOf(command) > -1) {
      callback(null, userPermit);
    } else {
      callback(null, false);
    }
  });
}

module.exports = checkPermit;
