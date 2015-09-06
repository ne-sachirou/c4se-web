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

function promissExec(cmd) {
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

gulp.task('clean', (done) => {
  del(['assets/**'], (err, paths) => {
    if (err) {
      return done(err);
    }
    console.log('Del ' + paths.join(', '));
    done();
  });
});

gulp.task('copy-assets', () => {
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

gulp.task('imagemin', () => {
  return gulp.src(SRCS.img).
    pipe(imagemin({
      optimizationLevel : 7,
      progressive       : true,
    })).
    pipe(gulp.dest('assets'));
});

gulp.task('js-build', () => {
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
  ].map((set) => {
    return gulp.src(set.src).
      pipe(plumber()).
      pipe(babel({
        modules : 'umd',
      })).
      pipe(concat(set.dest)).
      pipe(uglify({
        // outSourceMap : true,
        output       : {},
        compress     : { unsafe : true },
      })).
      pipe(gulp.dest('assets'));
  }));
});

gulp.task('jscs', () => gulp.src(SRCS.js).pipe(jscs()));

gulp.task('jshint', () => gulp.src(SRCS.js).pipe(jshint()).pipe(jshint.reporter('default')));

gulp.task('css-build', () => {
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

gulp.task('php-test', () => promissExec('vendor/bin/phing test'));

// This must not be done async.
gulp.task('seiji-propose', (done) => {
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

gulp.task('seiji-translate', () => {
  return gulp.src(SRCS.html).
    pipe(run('bin/seiji_translator', {silent : true})).
    pipe(gulp.dest('lib/views'));
});

gulp.task('seiji-uniseiji-font', () => promissExec('bin/uniseiji_font'));

gulp.task('watch', () => {
  gulp.watch(SRCS.html                                        , ['seiji-translate'    ]);
  gulp.watch(SRCS.img                                         , ['imagemin'           ]);
  gulp.watch(SRCS.js                                          , ['js-build', 'js-test']);
  gulp.watch('src/stylesheets/**/**.less'                     , ['less'               ]);
  gulp.watch(['index.php', 'lib/**/**.php', 'tests/**/**.php'], ['php-test'           ]);
});

gulp.task('build',   (done) => runSequence(['copy-assets', 'imagemin', 'js-build', 'css-build'], 'seiji', done));
gulp.task('js-test', ['jscs', 'jshint']);
gulp.task('seiji',   (done) => runSequence(['seiji-translate', 'seiji-uniseiji-font'], 'seiji-propose', done));
gulp.task('test',    ['js-test', 'php-test']);

// vim:fdm=marker:
