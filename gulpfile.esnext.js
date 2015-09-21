/* jshint node:true */
'use strict';
var cp = require('child_process'),
    fs = require('fs');
var del          = require('del'),
    glob         = require('glob'),
    gulp         = require('gulp'),
    autoprefixer = require('gulp-autoprefixer'),
    babel        = require('gulp-babel'),
    concat       = require('gulp-concat'),
    cssBase64    = require('gulp-css-base64'),
    imagemin     = require('gulp-imagemin'),
    jscs         = require('gulp-jscs'),
    jshint       = require('gulp-jshint'),
    less         = require('gulp-less'),
    plumber      = require('gulp-plumber'),
    run          = require('gulp-run'),
    uglify       = require('gulp-uglifyjs'),
    merge        = require('merge-stream'),
    runSequence  = require('run-sequence'),
    Ssh          = require('simple-ssh');
var SRCS = {
      html : 'lib/views/**/**.html',
      img  : 'src/images/**/**',
      js   : ['*.esnext.js', 'src/javascripts/**/**.js'],
    };

// {{{ Util
/**
 * Like Bluebird's Promise.reduce().
 */
function promiseSequence(defrreds) {
  return defrreds.reduce((promise, defrred) => {
    return promise.then(defrred);
  }, Promise.resolve(null));
}

function promiseExec(cmd) {
  return new Promise((resolve, reject) => {
    cp.exec(cmd, (err, stdout, stderr) => {
      console.log(stdout);
      if (err) {
        console.error(stderr);
        return reject(err);
      }
      resolve();
    });
  });
}

function promiseSpawn(cmd, options) {
  var proc = cp.spawn(cmd, options, {stdio : 'inherit'});
  return new Promise((resolve, reject) => {
    proc.on('exit', (code) => {
      if (0 !== code) {
        return reject(new Error(cmd + ' ' + options.join(' ') + ' ends with ' + code));
      }
      resolve();
    }).on('error', (err) => reject(err));
  });
}
// }}}

gulp.task('build', (done) => runSequence(['build:copy-assets', 'build:imagemin', 'build:js', 'build:css'], 'seiji', done));

gulp.task('build:copy-assets', () => {
  return merge([
    {
      src  : [
        'src/fonts/Yuraru ru Soin 01\'.ttf',
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
  ].map((set) => gulp.src(set.src).pipe(gulp.dest('assets' + set.dest))));
});

gulp.task('build:imagemin', () => {
  return gulp.src(SRCS.img).
    pipe(imagemin({
      optimizationLevel : 7,
      progressive       : true,
    })).
    pipe(gulp.dest('assets'));
});

gulp.task('build:js', () => {
  function build(src, dest) {
    return gulp.src(src).
      pipe(plumber()).
      pipe(babel({
        modules : 'umd',
      })).
      pipe(concat(dest)).
      // pipe(uglify({
      //   output   : {},
      //   compress : { unsafe : true },
      // })).
      pipe(gulp.dest('assets'));
  }

  return merge([
    build(
      [
        'src/javascripts/_baselib.js',
        'src/javascripts/layout.js',
      ],
      'layout.js'
    ),
    build(
      [
        'src/javascripts/_baselib.js',
        'src/javascripts/Wavable.js',
        'src/javascripts/index.js',
      ],
      'index.js'
    ),
    build(
      [
        'src/javascripts/_baselib.js',
        'src/javascripts/feed.js',
      ],
      'feed.js'
    ),
    build(
      [
        'src/javascripts/_baselib.js',
        'src/javascripts/vertical_latin.js',
      ],
      'vertical_latin.js'
    ),
    build(
      [
        'src/bower_components/regenerator/runtime.js',
        'src/javascripts/funisaya/world/ResourceLoader.js',
        'src/javascripts/funisaya/world/Scene.js',
        'src/javascripts/funisaya/world/FieldScene.js',
        'src/javascripts/funisaya/world/World.js',
        'src/javascripts/funisaya/world/main.js',
      ],
      'funisaya/world.js'
    )
  ]);
});

gulp.task('clean', (done) => {
  del(['assets/**'], (err, paths) => {
    if (err) {
      return done(err);
    }
    console.log('Del ' + paths.join(', '));
    done();
  });
});

gulp.task('deploy', (done) => {
  var ssh = new Ssh({
        agentForward : true,
        key          : fs.readFileSync(process.env.HOME + '/.ssh/id_rsa'),
        host         : 'c4se2.sakura.ne.jp',
        port         : 22,
        user         : 'c4se2',
      }),
      cmd = 'cd ~/www;' +
        'git pull --ff-only origin master;' +
        'composer install --no-dev;' +
        ''; // 'set SERVER_ENV=production; vendor/bin/phpmig migrate';
  ssh.exec(cmd, {
    out : (stdout) => console.log(stdout),
    err : (stderr) => console.error(stderr),
  }).on('end', () => done()).start();
});

gulp.task('test', ['test:js', 'test:php']);

gulp.task('test:js', ['test:js:jscs', 'test:js:jshint']);

gulp.task('test:js:jscs', () => gulp.src(SRCS.js).pipe(jscs()));

gulp.task('test:js:jshint', () => gulp.src(SRCS.js).pipe(jshint()).pipe(jshint.reporter('default')));

gulp.task('build:css', () => {
  gulp.src(['src/stylesheets/**/!(_)**.less']).
    pipe(plumber()).
    pipe(less({
      compress  : true,
      sourceMap : true,
    })).
    pipe(autoprefixer({
      browsers : ['last 2 version'],
    })).
    pipe(cssBase64({
      baseDir           : '.',
      maxWeightResource : 32768 * 4,
    })).
    pipe(gulp.dest('assets'));
});

gulp.task('test:php', () => promiseExec('vendor/bin/phing test'));

gulp.task('seiji', (done) => runSequence(['seiji:translate', 'seiji:uniseiji-font'], 'seiji:propose', done));

// This must not be done async.
gulp.task('seiji:propose', (done) => {
  glob(SRCS.html, (err, matches) => {
    if (err) {
      return done(err);
    }
    promiseSequence(matches.map((filename) => {
      return () => promiseSpawn('bin/seiji_proposer', [filename]);
    })).
      then(() => done()).
      catch((err) => {
        console.error(err);
        done(err);
      });
  });
});

gulp.task('seiji:translate', () => {
  return gulp.src(SRCS.html).
    pipe(run('bin/seiji_translator', {silent : true})).
    pipe(gulp.dest('lib/views'));
});

gulp.task('seiji:uniseiji-font', () => promissExec('bin/uniseiji_font'));

gulp.task('watch', () => {
  gulp.watch(SRCS.html                                        , ['seiji-translate'    ]);
  gulp.watch(SRCS.img                                         , ['imagemin'           ]);
  gulp.watch(SRCS.js                                          , ['js-build'/*, 'js-test'*/]);
  gulp.watch('src/stylesheets/**/**.less'                     , ['css-build'          ]);
  gulp.watch(['index.php', 'lib/**/**.php', 'tests/**/**.php'], ['php-test'           ]);
});

gulp.task('default', () => {
  return promiseExec('bin/gulp --tasks');
});

// vim:fdm=marker: