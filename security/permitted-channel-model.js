var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PermittedChannelSchema = new Schema({
  name: String,
  id: String,
  serverName: String,
  serverId: String,
  allPermitted: Boolean,
  permittedCommands: [String],
  forbiddenCommands: [String],
});

var PermittedChannelModel = mongoose.model('permitted-channel', PermittedChannelSchema);

module.exports = PermittedChannelModel;
