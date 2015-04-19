/* jshint node:true */
'use strict';
var cp = require('child_process');
var concat  = require('gulp-concat'),
    gulp    = require('gulp'),
    less    = require('gulp-less'),
    jscs    = require('gulp-jscs'),
    jshint  = require('gulp-jshint'),
    traceur = require('gulp-traceur'),
    uglify  = require('gulp-uglifyjs'),
    merge   = require('merge-stream');
var SRCS = {
      js : ['*.js', 'src/javascripts/**/**.js'],
    };

gulp.task('copy-assets', function () {
  return gulp.src([
      'node_modules/gulp-traceur/node_modules/traceur/bin/traceur-runtime.js',
    ]).
    pipe(gulp.dest('lib/assets'));
});

gulp.task('js-build', function () {
  return merge([
    {
      src : [
        'src/javascripts/index.js',
      ],
      dest : 'index.js'
    }
  ].map(function (set) {
    return gulp.src(set.src).
      pipe(traceur()).
      pipe(concat(set.dest)).
      pipe(uglify({
        outSourceMap : true,
        output       : {},
        compress     : { unsafe : true },
      })).
      pipe(gulp.dest('lib/assets'));
  }));
});

gulp.task('jscs', function () {
  return gulp.src(SRCS.js).
    pipe(jscs());
});

gulp.task('jshint', function () {
  return gulp.src(SRCS.js).
    pipe(jshint()).
    pipe(jshint.reporter('default'));
});

gulp.task('less', function () {
  gulp.src(['src/stylesheets/!(_)*.less']).
    pipe(less({
      compress  : true,
      sourceMap : true,
    })).
    pipe(gulp.dest('lib/assets'));
});

gulp.task('php-test', function (done) {
  cp.exec('vendor/bin/phing test', function (err, stdout, stderr) {
    console.log(stdout);
    if (err) {
      console.error(stderr);
      return done(err);
    }
    done();
  });
});

gulp.task('watch', function () {
  gulp.watch(SRCS.js, ['js-build', 'js-test']);
  gulp.watch('src/stylesheets/*.less', ['less']);
  gulp.watch(['index.php', 'lib/**/**.php', 'tests/**/**.php'], ['php-test']);
});

gulp.task('build', ['copy-assets', 'js-build', 'less']);
gulp.task('js-test', ['jscs', 'jshint']);
gulp.task('test', ['js-test', 'php-test']);
