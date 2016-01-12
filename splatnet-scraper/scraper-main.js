var request = require('request').defaults({jar: true}),
    //cheerio = require('cheerio'),
    credentials = require('../auth.json');

var fs = require('fs');

function SplatnetScraper() {
  this.schedule = [];
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
    callback(null, this.getScheduleAsMessage(this.schedule));
  } else {
    this.pollSchedule(callback);
  }
};

SplatnetScraper.prototype.scheduleValid = function(currentTime) {
  if (this.schedule.length == 0) {
    return false;
  }
  var beginTime = (new Date(this.schedule[0].begin)).getTime();
  var endTime = (new Date(this.schedule[0].end)).getTime();
  return (currentTime >= beginTime && currentTime < endTime);
};

SplatnetScraper.prototype.pollSchedule = function(callback) {
  //need to get html before json or get an error
  var uriHtml = 'https://splatoon.nintendo.net/schedule';
  var uriJson = 'https://splatoon.nintendo.net/schedule/index.json?locale=en';
  request(
    uriHtml,
    function(err, res, body) {
      if (err) {
        console.error('get ' + uriHtml + ' failed');
        return;
      }

      request(
        uriJson,
        function(err, res, body) {
          if (err) {
            console.error('get ' + uriHtml + ' failed');
            return;
          }

          var rawSchedule = JSON.parse(body);
          if (rawSchedule.error) {
            console.error('get ' + urijson + ' failed');
            return;
          }

          var jsonSchedule = this.parseScheduleJson(rawSchedule);
          this.schedule = jsonSchedule;
          var messageSchedule = this.getScheduleAsMessage(jsonSchedule);
          callback?callback(null, messageSchedule):null;

          //console.log(schedule);
        }.bind(this)
      )
    }.bind(this)
  );
};

SplatnetScraper.prototype.parseScheduleJson = function(rawSchedule) {
  //console.log(rawSchedule.schedule);
  if (!rawSchedule.festival) {
    var schedule = rawSchedule.schedule.map(function(obj) {
      return {
        begin: obj.datetime_begin,
        end: obj.datetime_end,
        turfMaps: [obj.stages.regular[0].name, obj.stages.regular[1].name],
        rankedMode: obj.gachi_rule,
        rankedMaps: [obj.stages.gachi[0].name, obj.stages.gachi[1].name],
      };
    })
  }

  return schedule;
};

SplatnetScraper.prototype.getScheduleAsMessage = function(jsonSchedule) {
  var message = '';
  for (var i=0; i < jsonSchedule.length; i++) {
    var timeString = this.getTimeString(jsonSchedule[i].begin);

    message += '**' + timeString + '** \n' +
      'Turf on ' + jsonSchedule[i].turfMaps[0] + ' and ' + jsonSchedule[i].turfMaps[1] + '\n' +
      jsonSchedule[i].rankedMode + ' on ' + jsonSchedule[i].rankedMaps[0] + ' and ' + jsonSchedule[i].rankedMaps[1] + '\n';
  }
  return message;
};

SplatnetScraper.prototype.getTimeString = function(time) {
  var beginTime = new Date(time);
  var difference = beginTime.getTime() - Date.now();
  var resultInMin = Math.round(difference / 60000);
  var timeString = ''
  if (resultInMin < 0) {
    timeString = 'Now';
  } else {
    var hour = Math.floor(resultInMin / 60);
    var minutes =  resultInMin % 60;
    timeString = 'In ' + hour + ' hours ' + minutes + ' minutes';
  }

  return timeString;
};

SplatnetScraper.prototype.getRanked = function(callback) {
  var uri = 'https://splatoon.nintendo.net/ranking?locale=en';
  request(
    uri,
    function(err, res, body) {
      if (err) {
        console.error('get ' + uri + ' failed');
        return;
      }

      //var schedule = this.parseScheduleHtml(body);
      fs.writeFile('./test.txt', body, function(err) {
        if (err) {
          return console.log(err);
        }
      });

      callback?callback(null, schedule):null

      //sconsole.log(schedule);
    }.bind(this)
  );
};

module.exports = SplatnetScraper;
