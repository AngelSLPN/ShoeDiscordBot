var command = {
  argIsUrl: function(arg) {
    var re = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    return re.test(arg);
  },

  hasArgs: function(args) {
    return args.length > 0;
  },

  useNested: function(commands) {
    return function(bot, message, args) {
      if (args[0]) {
        if (commands[args[0]]) {
          commands[args[0]].script(bot, message, args.slice(1));
        } else {
          message.channel.sendMessage('command not supported');
        }
      } else {
        commands['default'].script(bot, message, args);
      }
    }
  },
};

module.exports = command;
