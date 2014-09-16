'use strict';

var https = require('https');
var fs = require('fs');
var path = require('path');

var options = {
  key: fs.readFileSync(path.join(__dirname, 'certs', 'server.key')),
  cert: fs.readFileSync(path.join(__dirname, 'certs', 'server.crt'))
};

function resolveFile(path) {
  return !path ? 'index.html' : path;
}

function serve(port, root) {
  var server = https.createServer(options, function (req, res) {
    var wantedFile = resolveFile(req.url.split('/')[1]),
        fulleFilepath = path.join(__dirname, root, wantedFile),
        data = fs.readFileSync(fulleFilepath);
    res.writeHead(200);
    res.end(data);
  })
    .on('error', function(error) {
      server.close();
      throw error;
    })
    .listen(port);
  return server;
}


module.exports = serve;
