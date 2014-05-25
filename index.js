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
  var scriptPath = lookup('mocha-phantomjs/lib/mocha-phantomjs.coffee');
  var dump = options.dump;
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
      spawnPhantomJS([scriptPath, path.split(require('path').sep).join('/'), reporter], dump, cb);
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

function spawnPhantomJS(args, dump, cb) {
  var phantomjsPath = lookup('.bin/phantomjs', true);
  // case where npm is started with --no-bin-links
  if (!phantomjsPath) {
    phantomjsPath = lookup('phantomjs/bin/phantomjs', true);
  }
  if (!phantomjsPath) {
    cb(new gutil.PluginError(pluginName, 'PhantomJS not found'));
  } else {
    var phantomjs = spawn(phantomjsPath, args);
    var fileOutput = null;
    phantomjs.stdout.pipe(process.stdout);
    if (dump) {
        fileOutput = fs.createWriteStream(dump);
	phantomjs.stdout.pipe(fileOutput);
    }
    phantomjs.stderr.pipe(process.stderr);
    phantomjs.on('error', function (err) {
      cb(new gutil.PluginError(pluginName, err.message));
    });
    phantomjs.on('exit', function (code) {
      switch (code) {
        case 0:
          return cb();
        default:
          cb(new gutil.PluginError(pluginName, 'test failed'));
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
