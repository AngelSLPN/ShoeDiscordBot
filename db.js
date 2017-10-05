var mongoose = require('mongoose');

var dbUri = 'mongodb://mongo:27017/ShoeBot';

mongoose.connect(dbUri);

mongoose.connection.on('connected', function() {
  console.log('Mongoose default connection open to ' + dbUri);
});

mongoose.connection.on('error', function(err) {
  console.log('Mongoose default connection error:' + err);
});

mongoose.connection.on('disconnected', function() {
  console.log('Mongoose default connection disconnected');
});

process.on('SIGINT', function() {
  mongoose.connection.close(function() {
    console.log('Mongoose default connection disconnected through app termination');
    process.exit(0);
  });
});

// Schemas & Models
require('./splatoon/schedule-entry-model');
require('./security/permitted-channel-model');
