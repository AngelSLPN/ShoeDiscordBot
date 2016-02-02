var PermittedChannels = require('./server-model');

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
          permittedCommands: ['all'],
        };
        var model = new PermittedChannels(channel);
        model.save(function(err, entry) {
          if (err) return console.error(err);
        });
      } else {
        //change permission on channel to all
      }
    });
  },

  //mute the bot in the channel the command was executed in
  mute: function mute(bot, message, args) {
    PermittedChannels.findOne({ id: message.channel.id }, function (err, doc) {
      doc.allPermitted = false;
      doc.save();
    });

  },

  checkPermit: function(channel, command, callback) {
    PermittedChannels.findOne({id: channel.id}, function(err, doc) {
      if (err) {
        callback(err, false);
        console.log(err);
        return;
      }

      if (!doc) {
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
