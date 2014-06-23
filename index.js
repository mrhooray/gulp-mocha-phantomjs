'use strict';

var fs = require('fs');
var spawn = require('child_process').spawn;
var through = require('through2');
var gutil = require('gulp-util');
var async = require('async');
var pluginName = require('./package.json').name;

function mochaPhantomJS(options) {
  options = options || {};
  var reporter = options.reporter || 'spec';
  var dump = options.dump;
  var silentMode = Boolean(options.silentMode);
  var scriptPath = lookup('mocha-phantomjs/lib/mocha-phantomjs.coffee');
  var paths = [];
  return through.obj(function (file, enc, cb) {
    paths.push(file.path);
    this.push(file);
    cb();
  }, function (cb) {
    if (!scriptPath) {
      this.emit('error', new gutil.PluginError(pluginName, 'mocha-phantomjs.coffee not found'));
      return cb();
    }
    async.eachSeries(paths, function (path, cb) {
      spawnPhantomJS([scriptPath, path.split(require('path').sep).join('/'), reporter], dump, cb, silentMode);
    }, function (err) {
      if (err) {
        this.emit('error', err);
      }
      cb();
      // for testing purpose
      // be able to add a callback after _flush
      this.emit('after_flush');
    }.bind(this));
  });
}

function spawnPhantomJS(args, dump, cb, silentMode) {
  var phantomjsPath = lookup('.bin/phantomjs', true);
  // in case npm is started with --no-bin-links
  if (!phantomjsPath) {
    phantomjsPath = lookup('phantomjs/bin/phantomjs', true);
  }
  if (!phantomjsPath) {
    cb(new gutil.PluginError(pluginName, 'PhantomJS not found'));
  } else {
    var phantomjs = spawn(phantomjsPath, args);
    phantomjs.stdout.pipe(process.stdout);
    phantomjs.stderr.pipe(process.stderr);
    if (dump) {
      phantomjs.stdout.pipe(fs.createWriteStream(dump));
    }
    phantomjs.on('error', function (err) {
      cb(new gutil.PluginError(pluginName, err.message));
    });
    phantomjs.on('exit', function (code) {
      switch (code) {
        case 0:
          return cb();
        default:
          if (code === 1 && silentMode) {
            phantomjs.stdout.pipe(fs.createWriteStream('test failed'));
            return cb();
          } else {
            cb(new gutil.PluginError(pluginName, 'test failed'));
          }
      }
    });
  }
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
