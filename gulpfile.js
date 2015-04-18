/* jshint node:true */
'use strict';
var cp = require('child_process');
var gulp   = require('gulp'),
    jscs   = require('gulp-jscs'),
    jshint = require('gulp-jshint');

gulp.task('jscs', function () {
  return gulp.src(['*.js', 'src/javascripts/**/**.js']).
    pipe(jscs());
});

gulp.task('jshint', function () {
  return gulp.src(['*.js', 'src/javascripts/**/**.js']).
    pipe(jshint()).
    pipe(jshint.reporter('default'));
});

gulp.task('php-test', function (done) {
  cp.exec('vendor/bin/phing test', function (err, stdout, stderr) {
    if (err) {
      console.log(stdout);
      console.error(stderr);
      return done(err);
    }
    done();
  });
});

gulp.task('build', []);
gulp.task('js-test', ['jscs', 'jshint']);
gulp.task('test', ['js-test', 'php-test']);
