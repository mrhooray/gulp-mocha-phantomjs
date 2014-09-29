'use strict';

var https = require('https'),
    fs = require('fs'),
    path = require('path'),
    url = require('url');


var options = {
  key: fs.readFileSync(path.join(__dirname, 'certs', 'server.key')),
  cert: fs.readFileSync(path.join(__dirname, 'certs', 'server.crt'))
};

function serve(port) {
    var splitFilteredDirname =
          __dirname
            .split(path.sep)
            .filter(function (part) {
                return part !== 'test';
            }),
        serverRoot =
          splitFilteredDirname.join(path.sep),
        server =
          https.createServer(options, function (req, res) {
            var wantedFile =
                  url.parse(req.url).pathname
                    .split('/')
                    .join(path.sep),
                fullFilepath =
                  path.join(serverRoot, wantedFile),
                data =
                  fs.readFileSync(fullFilepath);
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
