'use strict';

var assert = require('assert');
var path = require('path');
var gutil = require('gulp-util');
var mochaPhantomJS = require('../index');
var out = process.stdout.write.bind(process.stdout);

describe('gulp-mocha-phantomjs', function () {
  it('should pass when test passed', function (cb) {
    var file = new gutil.File({path: path.join(__dirname, 'fixture-pass.html')});
    var stream = mochaPhantomJS();
    var passed = false;

    stream.on('error', function () {
      assert.fail(undefined, undefined, 'should not emit error');
    });

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
    var stream = mochaPhantomJS();

    stream.on('error', function (err) {
      assert.equal(err.plugin, require('../package.json').name);
      process.stdout.write = out;
      cb();
    });

    process.stdout.write = function () {};

    stream.write(file);
    stream.end();
  });

  it('should fail silently in silent mode', function (cb) {
    var file = new gutil.File({path: path.join(__dirname, 'fixture-fail.html')});
    var stream = mochaPhantomJS({silent: true});

    stream.on('error', function () {
      assert.fail(undefined, undefined, 'should not emit error');
    });

    stream.on('after_flush', function () {
      process.stdout.write = out;
      cb();
    });

    process.stdout.write = function () {};

    stream.write(file);
    stream.end();
  });

  it('should use the tap reporter when chosen', function (cb) {
    var file = new gutil.File({path: path.join(__dirname, 'fixture-pass.html')});
    var stream = mochaPhantomJS({reporter: 'tap'});
    var passed = false;

    stream.on('error', function () {
      assert.fail(undefined, undefined, 'should not emit error');
    });

    stream.on('after_flush', function () {
      assert.equal(passed, true);
      process.stdout.write = out;
      cb();
    });

    process.stdout.write = function (str) {
      if (/# pass 1/.test(str)) {
        passed = true;
      }
    };

    stream.write(file);
    stream.end();
  });
});
