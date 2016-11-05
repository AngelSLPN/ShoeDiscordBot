var express = require('express');
var mongo_express = require('mongo-express/lib/middleware');
var mongo_express_config = require('./mongo_express_config');

var server = express();
server.use('/mongo_express', mongo_express(mongo_express_config));

var port = 80;
server.listen(port);

module.exports = server;
