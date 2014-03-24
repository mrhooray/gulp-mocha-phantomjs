# [gulp](https://github.com/wearefractal/gulp)-mocha-phantomjs [![Build Status](https://travis-ci.org/mrhooray/gulp-mocha-phantomjs.svg?branch=master)](https://travis-ci.org/mrhooray/gulp-mocha-phantomjs)
> run client-side [Mocha](https://github.com/visionmedia/mocha) tests with [PhantomJS](https://github.com/ariya/phantomjs)

## Installation
### node
```shell
$ npm install gulp-mocha-phantomjs --save-dev
```

## Usage
```javascript
var gulp = require('gulp');
var mochaPhantomJS = require('gulp-mocha-phantomjs');

gulp.task('test', function () {
  return gulp
  .src('test/runner.html')
  .pipe(mochaPhantomJS());
});
```

## License
MIT
