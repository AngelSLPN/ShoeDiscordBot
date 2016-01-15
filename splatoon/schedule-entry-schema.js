var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ScheduleEntry = new Schema({
  begin: Date,
  end: Date,
  turfMaps: [String],
  rankedMode: String,
  rankedMaps: [String],
});
