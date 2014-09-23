'use strict';

var assert = require('assert');
var path = require('path');
var gutil = require('gulp-util');
var mochaPhantomJS = require('../index');
var out = process.stdout.write.bind(process.stdout);
var httpsServer = require('./https-server');
var createPhantomCLIparams = require('../cli');

describe('gulp-mocha-phantomjs', function () {
  it('should pass when test passed', function (cb) {
    var file = new gutil.File({path: path.join(__dirname, 'fixture-pass.html')});
    var stream = mochaPhantomJS();
    var passed = false;

    stream.on('error', function () {
      assert.fail(undefined, undefined, 'should not emit error');
    });

    stream.on('finish', function () {
      assert.equal(passed, true);
      process.stdout.write = out;
      cb();
    });

    process.stdout.write = function (str) {
      if (/3 passing/.test(str)) {
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

    stream.on('finish', function () {
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

    stream.on('finish', function () {
      assert.equal(passed, true);
      process.stdout.write = out;
      cb();
    });

    process.stdout.write = function (str) {
      if (/# pass 3/.test(str)) {
        passed = true;
      }
    };

    stream.write(file);
    stream.end();
  });

  it('should pass through mocha options', function (cb) {
    var file = new gutil.File({path: path.join(__dirname, 'fixture-pass.html')});
    var stream = mochaPhantomJS({mocha: {grep: 'viewport'}});
    var passed = false;

    stream.on('error', function () {
      assert.fail(undefined, undefined, 'should not emit error');
    });

    stream.on('finish', function () {
      assert.equal(passed, true);
      process.stdout.write = out;
      cb();
    });

    process.stdout.write = function (str) {
      if (/1 passing/.test(str)) {
        passed = true;
      }
      if (/should be false/.test(str) || /should be true/.test(str)) {
        assert.fail();
      }
    };

    stream.write(file);
    stream.end();
  });

  it('cli params are formed correctly', function () {
    var phantomJSCliParams = {
      ignoreSslErrors: true,
      maxDiskCacheSize: 1000,
      outputEncoding: 'utf8',
      webSecurityEnabled: false
    };
    var cliParams = createPhantomCLIparams(phantomJSCliParams);
    var desired = [
      '--ignore-ssl-errors=true',
      '--max-disk-cache-size=1000',
      '--output-encoding=utf8',
      '--web-security=false'
    ];
    assert.deepEqual(cliParams, desired);
  });

  it('cli params are used by phantomjs', function (done) {
    var server = httpsServer(4141, 'fixtures');
    var phantom = mochaPhantomJS({
      phantomjs: {
        ignoreSslErrors: true
      }
    });

    phantom.on('error', function (error) {
      process.stdout.write = out;
      server.close();
      error.message = 'shouldn\'t have emited error: ' + error.message;
      assert.fail(undefined, undefined, error);
    });

    var passed = false;

    phantom.on('finish', function () {
      process.stdout.write = out;
      server.close();
      assert.equal(passed, true);
      done();
    });

    process.stdout.write = function (str) {
      if (/1 passing/.test(str)) {
        passed = true;
      }
    };

    phantom.write({path: 'https://localhost:4141/'});
    phantom.end();
  });

});
