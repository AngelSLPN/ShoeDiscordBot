//a youtube song factory

var ytdl = require('ytdl-core'),
    gapis = require('googleapis'),
    auth = require('../auth.json');

function getYoutubeSong(url, callback) {
  var song = {};

  ytdl.getInfo(url, function(err, info) {
    song.title = info.title;
    song.length = info.length_seconds
    song.url = url;
    song.getStream = getYtStream.bind(null, song.url);

    callback(err, song);
  });
}

function isYtUrl(url) {
  //regex for youtube url
  var re = /^(https?\:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
  return re.test(url);
}

function getYtStream(url) {
  return new Promise(function(resolve, reject) {
    var stream = ytdl(url, {
      filter: 'audioonly',
      quality: 'lowest',
    });

    resolve(stream);
  });
}

function searchYoutube(query) {
  return new Promise(function(resolve, reject) {
    gapis.youtube('v3').search.list({
      part: 'snippet',
      maxResults: 1,
      auth: auth.youtube.api_key,
      type: 'video',
      q: query,
    }, function(err, res) {
      if (err) {
        reject(Error(err));
        console.log(err);
      }
      resolve({
        title: res.items[0].snippet.title,
        url: 'https://youtu.be/' + res.items[0].id.videoId
      });
    });
  });
}

var youtube = {
  getSong: getYoutubeSong,
  isYtUrl: isYtUrl,
  search: searchYoutube,
}

module.exports = youtube;
