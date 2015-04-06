'use strict';

var gulp = require('gulp');
var jshint = require('gulp-jshint');
var mocha = require('gulp-mocha');
var mochaPhantomJS = require('./');

var paths = {
    scripts: ['**/*.js', '!node_modules/**'],
    tests: 'test/**.*js'
};

gulp.task('jshint', function () {
    return gulp
    .src(paths.scripts)
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail'));
});

gulp.task('test', ['jshint'], function () {
    return gulp
    .src(paths.tests)
    .pipe(mocha({reporter: 'spec'}));
});

gulp.task('run', function () {
    return gulp
    .src('test/fixture-pass.html')
    .pipe(mochaPhantomJS({reporter: 'spec'}));
});

gulp.task('run:dump', function () {
    return gulp
    .src('test/fixture-pass.html')
    .pipe(mochaPhantomJS({reporter: 'xunit', dump:'dump.xml'}));
});

gulp.task('default', ['test']);
