var command = {
  hasArgs: function(args) {
    return args.length > 0;
  },

  useNested: function(commands) {
    return function(bot, message, args) {
      if (args[0]) {
        if (commands[args[0]]) {
          commands[args[0]].script(bot, message, args.slice(1));
        } else {
          bot.sendMessage(message.channel, 'command not supported');
        }
      } else {
        commands['default'].script(bot, message, args);
      }
    }
  },
};

module.exports = command;
