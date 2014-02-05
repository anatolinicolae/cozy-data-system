// Generated by CoffeeScript 1.6.2
var app, host, port, server;

require('coffee-script/register');

app = module.exports = function(params) {
  params = params || {};
  params.root = params.root || __dirname;
  return require('compound').createServer(params);
};

if (!module.parent) {
  port = process.env.PORT || 9101;
  host = process.env.HOST || "127.0.0.1";
  server = app();
  server.listen(port, host, function() {
    var msg;

    msg = ("Compound server listening on " + host + ":" + port + " within ") + ("" + (server.set('env')) + " environment");
    return console.log(msg);
  });
}
