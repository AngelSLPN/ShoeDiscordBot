var PermittedChannels = require('./permitted-channel-model');

Permit = {
  permit: function permit(bot, message, args) {
    PermittedChannels.findOne({'id': message.channel.id})
    .select('id')
    .exec(function(err, doc) {
      if (err) {
        return console.log(err);
      }
      if (!doc) {
        //add channel to db
        var channel = {
          name: message.channel.name,
          id: message.channel.id,
          serverName: message.channel.server.name,
          serverId: message.channel.server.id,
          allPermitted: true,
          permittedCommands: [],
          forbiddenCommands: [],
        };
        var model = new PermittedChannels(channel);
        model.save(function(err, entry) {
          if (err) return console.error(err);
        });
      } else {
        doc.allPermitted = true;
        doc.save();
        //change permission on channel to all
      }
    });
  },

  //mute the bot in the channel the command was executed in
  forbid: function forbid(bot, message, args) {
    PermittedChannels.findOne({ id: message.channel.id }, function (err, doc) {
      doc.allPermitted = false;
      doc.save();
    });
  },

  checkPermit: function(message, command, callback) {
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

      if (command == 'permit' && message.channel.server.owner.id == message.author.id) {
        callback(null, true);
      } else if (!doc) {
        callback(null, false);
      } else if (doc.forbiddenCommands.indexOf(command) > -1) {
        callback(null, false);
      } else if (doc.allPermitted) {
        callback(null, true);
      } else if (doc.permittedCommands.indexOf(command) > -1) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    });
  },
}

module.exports = Permit;
