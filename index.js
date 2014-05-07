'use strict';

var fs = require('fs');
var spawn = require('child_process').spawn;
var through = require('through2');
var gutil = require('gulp-util');
var async = require('async');
var path = require('path');

var pluginName = require('./package.json').name;


function mochaPhantomJS( options ) {
  
    options = options || {};
  
    var reporter = options.reporter || 'spec';
    var scriptPath = lookup('mocha-phantomjs/lib/mocha-phantomjs.coffee');
    var paths = [];

    var transform = function(file, enc, cb) {
        paths.push(file.path);
        this.push(file);
        cb();
    };

    var flush = function( done ){

        if ( !scriptPath ) {
            this.emit('error', new gutil.PluginError(pluginName, 'mocha-phantomjs.coffee not found'));
            return done();
        }

        var spawnCallback = function(err){

          if (err) {
            this.emit('error', err);
          }

          done();
          // for testing purpose
          // be able to add a callback after _flush
          this.emit('after_flush');
        }

        async.eachSeries(paths, function (filepath, cb) {
            // spawn-iterator 
            spawnPhantomJS(scriptPath, filepath, reporter, cb);

        }, spawnCallback.bind(this));
    };

    return through.obj( transform, flush); 
}

function spawnPhantomJS( scriptPath, filepath, reporter, cb ) {

    var phantomjsPath = lookup('.bin/phantomjs', true),
        phantomjs = null,
        args = [ scriptPath, 
                 filepath.split(path.sep).join('/'), 
                 reporter ];

    if (!phantomjsPath) {

        cb(new gutil.PluginError(pluginName, 'PhantomJS not found'));
    } 
    else {
  
        phantomjs = spawn(phantomjsPath, args);
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
                    cb(new gutil.PluginError(pluginName, 'test failed'));
            }
        });
    }
}

function lookup(filepath, isExecutable) {

    var absPath; 

    for (var i = 0, max = module.paths.length; i < max; i++) {

        absPath = path.join(module.paths[i], filepath);

        if (isExecutable && process.platform === 'win32') {
            absPath += '.cmd';
        }

        if (fs.existsSync(absPath)) {
          return absPath;
        }
    }
}

module.exports = mochaPhantomJS;