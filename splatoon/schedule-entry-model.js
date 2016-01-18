var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ScheduleEntrySchema = new Schema({
  begin: Date,
  end: Date,
  turfMaps: [String],
  rankedMode: String,
  rankedMaps: [String],
});

var ScheduleEntryModel = mongoose.model('schedule-entry', ScheduleEntrySchema);

module.exports = ScheduleEntryModel;
