var events = require('events');

function Queue(voiceCon) {
  events.EventEmitter.call(this);

  this.voiceCon = voiceCon;
  this.queue = [];
  this.currentStream = null;

  this.on('changed', this.checkChanged);
}

Queue.prototype.__proto__ = events.EventEmitter.prototype;

Queue.prototype.addSong = function(song) {
  console.log('queued ' + song.title);
  this.queue.push(song);
  this.emit('changed');
  return this.queue.length;
};

Queue.prototype.checkChanged = function() {
  if (this.voiceCon.playing) {
    return;
  } else {
    this.playNext();
  }
};

Queue.prototype.playNext = function() {
  if (this.queue.length <= 0) {
    console.log('no songs to play')
    return;
  }

  var song = this.queue.shift();
  console.log('playing ' + song.title);
  song.getStream().then(function(stream) {
    this.currentStream = stream;
    return this.voiceCon.playRawStream(
      stream,
      {
        volume: 0.12
      }
    );
  }.bind(this), function (err) {
    console.log(err);
  }).then(function(intent) {
    //console.log(intent);
    intent.on('end', function() {
      console.log('end playing ' + song.title);
      this.playNext();
    }.bind(this))
    intent.on('error', function(err) {
      console.log('error at end of ' + song.title);
      console.log(err);
      this.playNext();
    }.bind(this));
  }.bind(this), function(err) {
    console.log(err);
  });
};

Queue.prototype.play = function() {
  this.playNext();
};

Queue.prototype.skip = function() {
  if (this.currentStream) {
    this.currentStream.end();
    this.currentStream = null;
  }
  //this.voiceCon.stopPlaying();
};

Queue.prototype.stop = function() {
  this.queue = [];
  this.skip();
};

Queue.prototype.list = function() {
  var list = this.queue.map(function(song) {
    return song.title;
  });

  return list.join('\n');
};

module.exports = Queue;
