"use strict";

var Command = require("../lib/command");
var configstore = require("../lib/configstore");
//var logger = require("../lib/logger");
var clc = require("cli-color");

var utils = require("../lib/utils");
var api = require("../lib/api");
var auth = require("../lib/auth");
var _ = require("lodash");

module.exports = new Command("logout")
  .description("log the CLI out of Olympus")
  .action(function(options) {
    var user = configstore.get("user");
    var tokens = configstore.get("tokens");
    var currentToken = _.get(tokens, "refresh_token");
    var token = utils.getInheritedOption(options, "token") || currentToken;
    api.setRefreshToken(token);
    var next;
    if (token) {
      next = auth.logout(token);
    } else {
      next = Promise.resolve();
    }

    var cleanup = function() {
      if (token || user || tokens) {
        var msg = "Logged out";
        if (token === currentToken) {
          if (user) {
            msg += " from " + clc.bold(user.email);
          }
        } else {
          msg += ' token "' + clc.bold(token) + '"';
        }
        console.log(msg);
      } else {
        console.log("No need to logout, not logged in");
      }
    };
    return next.then(cleanup, function() {
      console.log("Invalid refresh token, did not need to deauthorize");
      cleanup();
    });
  });