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
        console.log(message);
        var channel = {
          name: message.channel.name,
          id: message.channel.id,
          serverName: message.channel.guild.name,
          serverId: message.channel.guild.id,
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
}

module.exports = Permit;
