// Generated by CoffeeScript 1.9.0
var log;

log = require('printit')({
  prefix: 'init'
});

module.exports = function(app, server, callback) {
  var db, feed;
  feed = require('./lib/feed');
  feed.initialize(server);
  db = require('./lib/db');
  return db(function() {
    var init;
    init = require('./lib/init');
    return init.removeLostBinaries(function(err) {
      if (err != null) {
        log.error(err);
      }
      if (callback != null) {
        return callback(app, server);
      }
    });
  });
};
