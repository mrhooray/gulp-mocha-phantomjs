'use strict';

var fs = require('fs');
var url = require('url');
var spawn = require('child_process').spawn;
var _ = require('highland');
var through = require('through2');
var gutil = require('gulp-util');
var pluginName = require('./package.json').name;
var cli = require('./cli');


function mochaPhantomJS(options) {
  options = options || {};
  var scriptPath = lookup('mocha-phantomjs/lib/mocha-phantomjs.coffee');

  if (!scriptPath) {
    throw new gutil.PluginError(pluginName, 'mocha-phantomjs.coffee not found');
  }

  return through.obj(function (file, enc, cb) {
    var givenUrl =
          url.format({
            pathname: file.path.split(require('path').sep).join('/'),
            query: options.mocha || {}
          }),
        reporter = options.reporter || 'spec',
        mochaPhantomOptions = cli.removeCliParams(options.phantomjs),
        cliParams = cli.createPhantomCliParams(options.phantomjs),
        transform = options.transform ? options.transform.enabled : false,
        args = [
          scriptPath,
          givenUrl,
          reporter,
          JSON.stringify(mochaPhantomOptions)
        ];

    cliParams.forEach(function(param) {
      args.unshift(param);
    });

    spawnPhantomJS(givenUrl, args, options, function (err, output) {
      if (err) {
        this.emit('error', err);
      }
      if (transform) {
        var outputFile = new gutil.File({
            cwd: __dirname,
            path: file.path,
            contents: new Buffer(output)
        });
        this.push(outputFile);
      }
      else {
        this.push(file);
      }
      cb();
    }.bind(this));
  });
}

function spawnPhantomJS(givenUrl, args, options, cb) {
  // in case npm is started with --no-bin-links
  var phantomjsPath = lookup('.bin/phantomjs', true) || lookup('phantomjs/bin/phantomjs', true),
      dump = options.output,
      transform = options.transform ?
        options.transform.enabled : false,
      outputFilter = transform ?
        options.transform.outputFilter : function() { return true; };


  if (!phantomjsPath) {
    return cb(new gutil.PluginError(pluginName, 'PhantomJS not found'));
  }

  var phantomjs = spawn(phantomjsPath, args),
      outputStream = transform ?
        _(phantomjs.stdout)
          .filter(outputFilter)
          .collect()
          .map(function(outputData) {
            return outputData.join('');
          }) : _([]);


  if (dump) {
    phantomjs.stdout.pipe(fs.createWriteStream(options.dump));
  }

  if (!transform) {
    phantomjs.stdout.pipe(process.stdout);
  }

  phantomjs.stderr.pipe(process.stderr);

  phantomjs.on('error', function (err) {
    cb(new gutil.PluginError(pluginName, err.message));
  });

  phantomjs.on('exit', function (code) {
    outputStream.apply(function(finalOutput) {
      if (code === 0 || options.silent) {
        cb(undefined, finalOutput);
      } else {
        var error = 'Test failed on path ' + givenUrl + ' ' + finalOutput;
        cb(new gutil.PluginError(pluginName,
                                 error,
                                 {showStack: false}),
           finalOutput);
      }
    });
  });
}

function lookup(path, isExecutable) {
  for (var i = 0 ; i < module.paths.length; i++) {
    var absPath = require('path').join(module.paths[i], path);
    if (isExecutable && process.platform === 'win32') {
      absPath += '.cmd';
    }
    if (fs.existsSync(absPath)) {
      return absPath;
    }
  }
}

module.exports = mochaPhantomJS;
