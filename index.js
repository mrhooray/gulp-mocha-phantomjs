'use strict';

var path = require('path');
var spawn = require('child_process').spawn;
var through = require('through2');
var gutil = require('gulp-util');
var async = require('async');
var pluginName = require('./package.json').name;

function gulpMochaPhantomJS() {
  var script = path.join(__dirname, 'node_modules/mocha-phantomjs/lib/mocha-phantomjs.coffee');
  var paths = [];
  return through.obj(function (file, enc, cb) {
    paths.push(file.path);
    this.push(file);
    cb();
  }, function (cb) {
    async.eachSeries(paths, function (path, cb) {
      spawnPhantomJS([script, path], cb);
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

function spawnPhantomJS(args, cb) {
  var phantomjs = spawn(path.join(__dirname, 'node_modules/phantomjs/bin/phantomjs'), args);
  phantomjs.stdout.pipe(process.stdout);
  phantomjs.stderr.pipe(process.stderr);
  phantomjs.on('error', function (err) {
    cb(new gutil.PluginError(pluginName, err.message));
  });
  phantomjs.on('exit', function (code) {
    switch (code) {
      case 0:
        return cb();
      default:
        return cb(new gutil.PluginError(pluginName, 'test failed'));
    }
  });
}

module.exports = gulpMochaPhantomJS;
