"use strict";

var OlympusError = function(message, options) {
  options = options || {};

  this.name = "FirebaseError";
  this.message = message;
  this.children = options.children || [];
  this.status = options.status || 500;
  this.exit = options.exit || 1;
  this.stack = new Error().stack;
  this.original = options.original;
  this.context = options.context;
};
OlympusError.prototype = Object.create(Error.prototype);

module.exports = OlympusError;