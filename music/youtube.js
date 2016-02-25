//a youtube song factory

var ytdl = require('ytdl-core');


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

module.exports = getYoutubeSong;
