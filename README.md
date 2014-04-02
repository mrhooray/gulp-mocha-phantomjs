# [gulp](https://github.com/wearefractal/gulp)-mocha-phantomjs [![Build Status](https://travis-ci.org/mrhooray/gulp-mocha-phantomjs.svg?branch=master)](https://travis-ci.org/mrhooray/gulp-mocha-phantomjs)
> run client-side [Mocha](https://github.com/visionmedia/mocha) tests with [PhantomJS](https://github.com/ariya/phantomjs)

## Installation
### node
```shell
$ npm install gulp-mocha-phantomjs --save-dev
```

## Usage
```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mocha Test Runner</title>
    <link rel="stylesheet" href="bower_components/mocha/mocha.css">
  </head>
  <body>
    <div id="mocha"></div>
    <script src="bower_components/mocha/mocha.js"></script>
    <script src="bower_components/should/should.js"></script>
    <script>mocha.setup('bdd')</script>
    <script src="spec/test.js"></script>
    <script>
      if (window.mochaPhantomJS) {
        mochaPhantomJS.run();
      } else {
        mocha.run();
      }
    </script>
  </body>
</html>
```

```javascript
var gulp = require('gulp');
var mochaPhantomJS = require('gulp-mocha-phantomjs');

gulp.task('test', function () {
  return gulp
  .src('test/runner.html')
  .pipe(mochaPhantomJS());
});
```

The reporter can be chosen by supplying an object with a property `reporter`:

```javascript
gulp.task('testflight', function () {
  return gulp
  .src('test/runner.html')
  .pipe(mochaPhantomJS({reporter: 'flight'}));
});
```

## License
MIT
