'use strict';

var assert = require('assert');
var path = require('path');
var gutil = require('gulp-util');
var gulpMochaPhantomJS = require('../index');
var out = process.stdout.write.bind(process.stdout);

describe('gulp-mocha-phantomjs', function () {
  it('should pass when test passed', function (cb) {
    var file = new gutil.File({path: path.join(__dirname, 'fixture-pass.html')});
    var stream = gulpMochaPhantomJS();
    var passed = false;

    stream.on('after_flush', function () {
      assert.equal(passed, true);
      process.stdout.write = out;
      cb();
    });
    process.stdout.write = function (str) {
      if (/1 passing/.test(str)) {
        passed = true;
      }
    };
    stream.write(file);
    stream.end();
  });

  it('should fail build when test failed', function (cb) {
    var file = new gutil.File({path: path.join(__dirname, 'fixture-fail.html')});
    var stream = gulpMochaPhantomJS();
    stream.on('error', function (err) {
      assert.equal(err.plugin, require('../package.json').name);
      process.stdout.write = out;
      cb();
    });
    process.stdout.write = function () {};
    stream.write(file);
    stream.end();
  });
});
