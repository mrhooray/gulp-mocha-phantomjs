'use strict';

var fs = require('fs');
var url = require('url');
var spawn = require('child_process').spawn;
var through = require('through2');
var gutil = require('gulp-util');
var pluginName = require('./package.json').name;
var extend = require('./extend');

function mochaPhantomJS(options) {
  options = options || {};
  var scriptPath = lookup('mocha-phantomjs/lib/mocha-phantomjs.coffee');

  if (!scriptPath) {
    throw new gutil.PluginError(pluginName, 'mocha-phantomjs.coffee not found');
  }

  return through.obj(function (file, enc, cb) {
    var args = [
      scriptPath,
      mergeQuery(file.path, options.mocha),
      options.reporter || 'spec',
      JSON.stringify(options.phantomjs || {})
    ];

    spawnPhantomJS(args, options, function (err) {
      if (err) {
        this.emit('error', err);
      }

      this.push(file);

      cb();
    }.bind(this));
  });
}

function mergeQuery(path, query) {
  var parsed = url.parse(crossPlatform(path), true);

  parsed.query = extend(parsed.query, query);
  parsed.search = null;

  return url.format(parsed);
}

function crossPlatform(str) {
  return str.split(require('path').sep).join('/');
}

function spawnPhantomJS(args, options, cb) {
  // in case npm is started with --no-bin-links
  var phantomjsPath = lookup('.bin/phantomjs', true) || lookup('phantomjs/bin/phantomjs', true);

  if (!phantomjsPath) {
    return cb(new gutil.PluginError(pluginName, 'PhantomJS not found'));
  }

  var phantomjs = spawn(phantomjsPath, args);

  if (options.dump) {
    phantomjs.stdout.pipe(fs.createWriteStream(options.dump));
  }

  phantomjs.stdout.pipe(process.stdout);
  phantomjs.stderr.pipe(process.stderr);

  phantomjs.on('error', function (err) {
    cb(new gutil.PluginError(pluginName, err.message));
  });

  phantomjs.on('exit', function (code) {
    if (code === 0 || options.silent) {
      cb();
    } else {
      cb(new gutil.PluginError(pluginName, 'test failed'));
    }
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
