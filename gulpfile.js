/* jshint node:true */
'use strict';
var cp = require('child_process');
var del      = require('del'),
    gulp     = require('gulp'),
    concat   = require('gulp-concat'),
    imagemin = require('gulp-imagemin'),
    jscs     = require('gulp-jscs'),
    jshint   = require('gulp-jshint'),
    less     = require('gulp-less'),
    traceur  = require('gulp-traceur'),
    uglify   = require('gulp-uglifyjs'),
    merge    = require('merge-stream');
var SRCS = {
      js  : ['*.js', 'src/javascripts/**/**.js'],
      img : 'src/images/*',
    };

gulp.task('clean', function (done) {
  del(['lib/assets/**'], function (err, paths) {
    if (err) {
      return done(err);
    }
    console.log('Del ' + paths.join(', '));
    done();
  });
});

gulp.task('copy-assets', function () {
  return merge([
    {
      src  : [
        traceur.RUNTIME_PATH,
        'src/fonts/*',
        'src/bower_components/TAKETORI-JS/taketori.js',
        'src/bower_components/TAKETORI-JS/taketori.css',
      ],
      dest : ''
    },
    {
      src  : [
        'src/bower_components/font-awsome/css/font-awesome.min.css',
        'src/bower_components/font-awsome/fonts/*',
      ],
      dest : '/fonts'
    },
  ].map(function (set) {
    return gulp.src(set.src).pipe(gulp.dest('lib/assets' + set.dest));
  }));
});

gulp.task('imagemin', function () {
  return gulp.src(SRCS.img).
    pipe(imagemin({
      optimizationLevel : 7,
      progressive       : true,
    })).
    pipe(gulp.dest('lib/assets'));
});

gulp.task('js-build', function () {
  return merge([
    {
      src : [
        'src/javascripts/_baselib.js',
        'src/javascripts/layout.js',
      ],
      dest : 'layout.js'
    },
    {
      src : [
        'src/javascripts/_baselib.js',
        'src/javascripts/_wavable.js',
        'src/javascripts/index.js',
      ],
      dest : 'index.js'
    },
    {
      src : [
        'src/javascripts/_baselib.js',
        'src/javascripts/feed.js',
      ],
      dest : 'feed.js'
    },
    {
      src : [
        'src/javascripts/_baselib.js',
        'src/javascripts/vertical_latin.js',
      ],
      dest : 'vertical_latin.js'
    },
  ].map(function (set) {
    return gulp.src(set.src).
      pipe(traceur({
        modules : 'inline',
      })).
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

gulp.task('php-build', function (done) {
  var ant = cp.spawn('vendor/bin/phing', ['build']);

  function sendInput() {
    var chunk = process.stdin.read();
    if (null === chunk) {
      return;
    }
    ant.stdin.write(chunk);
  }

  ant.on('close', function (code) {
    process.stdin.removeListener('readable', sendInput);
    if (code !== 0) {
      return done(new Error());
    }
    done();
  }).on('error', function (err) {
    console.error(err);
    done(err);
  });
  ant.stdout.on('data', function (chunk) {
    process.stdout.write(chunk);
  });
  ant.stderr.on('data', function (chunk) {
    process.stderr.write(chunk);
  });
  process.stdin.on('readable', sendInput);
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
  gulp.watch(SRCS.img, ['imagemin']);
  gulp.watch(SRCS.js, ['js-build', 'js-test']);
  gulp.watch('src/stylesheets/*.less', ['less']);
  gulp.watch(['index.php', 'lib/**/**.php', 'tests/**/**.php'], ['php-test']);
});

gulp.task('build', ['copy-assets', 'imagemin', 'js-build', 'less', 'php-build']);
gulp.task('js-test', ['jscs', 'jshint']);
gulp.task('test', ['js-test', 'php-test']);
