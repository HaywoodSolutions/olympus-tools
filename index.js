"use strict";

var program = require('commander');
var pkg = require("./package.json");
var logger = require("./lib/logger");
var didYouMean = require("didyoumean");
 
program.version(pkg.version)
 
var client = {};
client.cli = program;
client.logger = require("./lib/logger");
client.errorOut = function(error, status) {
  require("./lib/errorOut")(client, error, status);
};
client.getCommand = function(name) {
  for (var i = 0; i < client.cli.commands.length; i++) {
    if (client.cli.commands[i]._name === name) {
      return client.cli.commands[i];
    }
  }
  return null;
};

require("./commands")(client);


var commandNames = program.commands.map(function(cmd) {
  return cmd._name;
});

program.action(function(cmd, cmd2) {
  logger.error("Error:" +cmd + "is not a Firebase command");

  var suggestion = didYouMean(cmd, commandNames);
  suggestion = suggestion || didYouMean([cmd, cmd2].join(":"), commandNames);
  if (suggestion) {
    logger.error();
    logger.error("Did you mean", clc.bold(suggestion) + "?");
  }

  process.exit(1);
});

program.parse(process.argv);