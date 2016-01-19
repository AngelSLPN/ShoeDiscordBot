var request = require('request').defaults({jar: true}),
    scheduler = require('node-schedule'),
    async = require('async'),
    credentials = require('../auth.json'),
    ScheduleEntry = require('./schedule-entry-model');

//for prototyping
var fs = require('fs');

function SplatnetScraper() {
  this.schedule = [];
  this.getSchedule();
}

SplatnetScraper.prototype.login = function(callback) {
  request.post({
    uri: "https://id.nintendo.net/login",
    headers: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    body: require('querystring').stringify(credentials.nintendo)
  }, function(err, res, body) {
    if (err) {
      console.error('Login failed');
      return;
    }
    if (res.statusCode != 303) {
      console.error('Login failed');
    }
    callback?callback():null;
  });
};

SplatnetScraper.prototype.getSchedule = function(callback) {
  if (this.scheduleValid(Date.now())) {
    if (callback) {
      callback(null, this.getScheduleAsMessage(this.schedule));
    }
    //callback?callback(null, this.getScheduleAsMessage(this.schedule)):null;
  } else {
    async.series(
      [
        this.login,
        this.pollSchedule.bind(this),
      ],
      function(err, results) {
        callback?callback(err, results[1]):null;
      }
    );
  }
  /*if (this.scheduleValid()) {
    callback(null, this.getScheduleAsMessage(this.schedule));
  } else {
    ;
  }*/
};

SplatnetScraper.prototype.scheduleValid = function(currentTime) {
  if (this.schedule.length == 0) {
    return false;
  }
  var afterBeginTime = currentTime >= this.schedule[0].begin.getTime();
  var beforeEndTime = currentTime < this.schedule[0].end.getTime();
  return (afterBeginTime && beforeEndTime);
};

SplatnetScraper.prototype.poll = function(options) {
  request(options.uriHtml, function(err, res, body) {
    if (err) {
      console.error('get ' + options.uriHtml + ' failed');
      return;
    }

    request(options.uriJson, function(err, res, body) {
      if (err) {
        console.error('get ' + options.uriJson + ' failed');
        return;
      }

      var result = options.parseFunction(body);

      options.callback?options.callback(null, result):null;
    }.bind(this));
  }.bind(this));
};

SplatnetScraper.prototype.pollSchedule = function(callback) {
  var uriJson = 'https://splatoon.nintendo.net/schedule/index.json?locale=en'
  this.poll({
    uriHtml: 'https://splatoon.nintendo.net/schedule',
    uriJson: uriJson,
    callback: callback,
    parseFunction: function(body) {
      var rawSchedule = JSON.parse(body);
      if (rawSchedule.error) {
        console.error('get ' + uriJson + ' failed: ' + rawSchedule.error);
        return;
      }

      var jsonSchedule = this.parseScheduleJson(rawSchedule);
      this.schedule = jsonSchedule;
      this.saveScheduleToDb(jsonSchedule);
      this.scheduleNextUpdate(jsonSchedule);
      console.log('updated splatnet schedule at ' + new Date());
      return this.getScheduleAsMessage(jsonSchedule);
    }.bind(this),
  });
};

SplatnetScraper.prototype.scheduleNextUpdate = function(jsonSchedule) {
  //update time 5 minutes after schedule is done to give buffer for time differences
  var date = new Date(jsonSchedule[0].end.getTime() + 3*60000);
  var j = scheduler.scheduleJob(date, this.getSchedule.bind(this));
};

SplatnetScraper.prototype.saveScheduleToDb = function(schedule) {
  for (var i=0; i < schedule.length; i++) {
    ScheduleEntry.findOne({'begin': schedule[i].begin})
    .select('begin end')
    .exec(function(err, doc) {
      if (err) {
        return console.log(err);
      }
      if (!doc) {
        var model = new ScheduleEntry(this);
        model.save(function(err, entry) {
          if (err) return console.error(err);
        });
      }
    }.bind(schedule[i]));
  }
};

SplatnetScraper.prototype.parseScheduleJson = function(rawSchedule) {
  var schedule;
  if (!rawSchedule.festival) {
    schedule = rawSchedule.schedule.map(function(obj) {
      return {
        begin: new Date(obj.datetime_begin),
        end: new Date(obj.datetime_end),
        turfMaps: [obj.stages.regular[0].name, obj.stages.regular[1].name],
        rankedMode: obj.gachi_rule,
        rankedMaps: [obj.stages.gachi[0].name, obj.stages.gachi[1].name],
      };
    });
  } else {
    schedule = [{
      begin: new Date(rawSchedule.schedule[0].datetime_begin),
      end: new Date(rawSchedule.schedule[0].datetime_end),
      alpha: rawSchedule.schedule[0].team_alpha_name,
      bravo: rawSchedule.schedule[0].team_bravo_name,
      splatfestMaps: rawSchedule.schedule[0].stages.map(function(stage) {return stage.name;}),
    }];
  }

  return schedule;
};

SplatnetScraper.prototype.getScheduleAsMessage = function(jsonSchedule) {
  var message = '';
  for (var i=0; i < jsonSchedule.length; i++) {
    var timeString = this.getTimeString(jsonSchedule[i].begin);

    message += '**' + timeString + '** \n'
    if (jsonSchedule[i].turfMaps) {
      message += 'Turf on '  + jsonSchedule[i].turfMaps[0] + ' and ' + jsonSchedule[i].turfMaps[1] + '\n';
    }
    if (jsonSchedule[i].rankedMaps) {
      message += jsonSchedule[i].rankedMode + ' on ' + jsonSchedule[i].rankedMaps[0] + ' and ' + jsonSchedule[i].rankedMaps[1] + '\n';
    }
    if (jsonSchedule[i].splatfestMaps) {
      message += jsonSchedule[i].alpha + ' vs ' + jsonSchedule[i].bravo + ' on ' + jsonSchedule[i].splatfestMaps[0] + ', ';
      message += jsonSchedule[i].splatfestMaps[1] + ', and ' + jsonSchedule[i].splatfestMaps[2];
    }
  }
  return message;
};

SplatnetScraper.prototype.getTimeString = function(time) {
  var difference = time.getTime() - Date.now();
  var resultInMin = Math.round(difference / 60000);
  var timeString = ''
  if (resultInMin < 0) {
    timeString = 'Now';
  } else {
    var hour = Math.floor(resultInMin / 60);
    var minutes =  resultInMin % 60;
    timeString = 'In ';

    if (hour > 0) {
      timeString += hour + ' hour';
      timeString += (hour > 1)?'s ':' ';
    }
    timeString += minutes + ' minutes';
  }

  return timeString;
};
/*
//get and record ranked list
SplatnetScraper.prototype.getRanked = function(callback) {
  this.poll({
    uriHtml: 'https://splatoon.nintendo.net/ranking?locale=en',
    uriJson: 'https://splatoon.nintendo.net/ranking/index.json?locale=en',
    callback: callback,
    parseFunction: function(body) {

      fs.writeFile('./test.txt', body, function(err) {
        if (err) {
          return console.log(err);
        }
        console.log('gotten');
      });
      return;
    }.bind(this),
  });
};*/

module.exports = SplatnetScraper;
