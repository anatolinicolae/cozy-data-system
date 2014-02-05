// Generated by CoffeeScript 1.6.3
var express, logging;

express = require('express');

logging = require('../../lib/logging');

module.exports = function(compound) {
  var app;
  app = compound.app;
  return logging.init(compound, function(stream) {
    return app.configure('production', function() {
      app.set('quiet', true);
      return app.use(express.errorHandler);
    });
  });
};