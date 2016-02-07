/*eslint strict: [1, "global"]*/
'use strict';
require('babel-polyfill');
var cp           = require('child_process');
var del          = require('del');
var fs           = require('fs');
var glob         = require('glob');
var gulp         = require('gulp');
var autoprefixer = require('gulp-autoprefixer');
var babel        = require('gulp-babel');
var concat       = require('gulp-concat');
var cssBase64    = require('gulp-css-base64');
var eslint       = require('gulp-eslint');
var imagemin     = require('gulp-imagemin');
var plumber      = require('gulp-plumber');
var rollup       = require('gulp-rollup');
var sass         = require('gulp-sass');
var uglify       = require('gulp-uglify');
var merge        = require('merge-stream');
var runSequence  = require('run-sequence');
var Ssh          = require('simple-ssh');

var SRCS = {
  html: 'lib/views/**/**.html',
  img : 'src/images/**/**',
  js  : ['gulpfile.babel.js', 'src/javascripts/**/*.js'],
  sass: 'src/stylesheets/**/!(_)*.+(sass|scss)',
};

glob = promisify(glob);

// {{{ Util
function promisify(func) {
  return function (...args) {
    var me = this;
    return new Promise((resolve, reject) => {
      function done(err, ...args) {
        if (err) {
          return reject(err);
        }
        resolve.apply(me, args);
      }

      args.push(done);
      func.apply(me, args);
    });
  };
}

function promiseSequence(deferreds) {
  return deferreds.reduce(
    (promise, deferred) => promise.then(deferred),
    Promise.resolve(null)
  );
}

function exec(cmd) {
  return new Promise((resolve, reject) => {
    cp.exec(cmd, (err, stdout, stderr) => {
      console.log(stdout);
      if (err) {
        console.error(stderr);
        return reject(err);
      }
      resolve(stdout);
    });
  });
}

function spawn(cmd, options) {
  var proc = cp.spawn(cmd, options, {stdio : 'inherit'});
  return new Promise((resolve, reject) => {
    proc.on('exit', (code) => {
      if (0 !== code) {
        return reject(new Error(`${cmd} ${options.join(' ')} ends with ${code}`));
      }
      resolve();
    }).on('error', (err) => reject(err));
  });
}
// }}}

gulp.task('build', ['clean'], (done) => runSequence(['build:copy-assets', 'build:css', 'build:imagemin', 'build:js'], 'seiji', done));

gulp.task('build:copy-assets', () => {
  function build(src, dest = '') {
    return gulp.src(src).pipe(gulp.dest(`assets/${dest}`));
  }

  return merge([
    build(
      [
        "src/bower_components/TAKETORI-JS/taketori.css",
        "src/bower_components/TAKETORI-JS/taketori.js",
        'src/fonts/Vertical_Latin_Calligraphic.otf',
        "src/fonts/Yuraru ru Soin 01'.ttf",
      ]
    ),
    build(
      [
        'src/bower_components/font-awsome/css/font-awesome.min.css',
        'src/bower_components/font-awsome/fonts/*',
      ],
      'fonts'
    ),
  ]);
});

gulp.task('build:css', () => {
  return gulp.src(SRCS.sass).
    pipe(plumber()).
    pipe(sass({outputStyle: 'compressed'})).
    pipe(autoprefixer({browsers: ['last 2 version']})).
    pipe(cssBase64({
      baseDir          : '.',
      maxWeightResource: 32768 * 4,
    })).
    pipe(gulp.dest('assets'));
});

gulp.task('build:imagemin', () => {
  return gulp.src(SRCS.img).
    pipe(imagemin({
      optimizationLevel: 7,
      progressive      : true,
    })).
    pipe(gulp.dest('assets'));
});

gulp.task('build:js', () => {
  function build(src, dest = '') {
    return gulp.src(src).
      pipe(plumber()).
      pipe(rollup()).
      pipe(babel()).
      pipe(gulp.dest(`assets/${dest}`));
  }

  return merge([
    build('src/javascripts/layout.js'),
    build('src/javascripts/index.js'),
    build('src/javascripts/feed.js'),
    build('src/javascripts/vertical_latin/index.js', 'vertical_latin/'),
    build('src/javascripts/vertical_latin/layout.js', 'vertical_latin/'),
  ]);
});

gulp.task('clean', () => {
  return del(['assets/+(!.keep|**)']).
    then((paths) => console.log('Del ' + paths.join(', ')))
});

gulp.task('deploy', ['build'], async () => {
  var ssh = new Ssh({
        agentForward: true,
        key         : fs.readFileSync(process.env.HOME + '/.ssh/id_rsa'),
        host        : 'c4se2.sakura.ne.jp',
        port        : 22,
        user        : 'c4se2',
      });

  function sshExec(cmd) {
    return new Promise((resolve, reject) => {
      ssh.exec(
        cmd,
        {
          out: (stdout) => console.log(stdout),
          err: (stderr) => console.error(stderr),
        }
      ).
        on('end', () => resolve()).
        start();
    });
  }

  // if ('' !== await exec('git status --porcelain')) {
  //   throw new Error('Please commit all changes');
  // }
  // if ('' !== await exec('git push -n origin master')) {
  //   throw new Error('Please push all changes');
  // }
  // if ('master\n' !== await exec("git branch | awk '/^\\*/{print $2}'")) {
  //   throw new Error('Please `git checkout master`');
  // }
  await sshExec(
    'cd ~/www;' +
    'git pull --ff-only origin master;' +
    'composer install --no-dev;' +
    '' // 'set SERVER_ENV=production; vendor/bin/phpmig migrate';
  );
  return exec('rsync -azh --delete --stats assets c4se2@c4se2.sakura.ne.jp:/home/c4se2/www');
});

gulp.task('test', ['test:js', 'test:php']);

gulp.task('test:js', () => {
  return gulp.src(SRCS.js).
    pipe(eslint()).
    pipe(eslint.format()).
    pipe(eslint.failOnError());
});

gulp.task('test:php', () => exec('vendor/bin/phing test'));

// 他のタスクと同時に実行してはならない
gulp.task('seiji', (done) => runSequence(['seiji:translate', 'seiji:uniseiji-font'], 'seiji:propose', done));

// 他のタスクと同時に実行してはならない
gulp.task('seiji:propose', async () => {
  return promiseSequence(
    (await glob(SRCS.html)).map((filename) => {
      return () => spawn('bin/seiji_proposer', [filename]);
    })
  );
});

gulp.task('seiji:translate', async () => {
  return Promise.all([
    (await glob(SRCS.html)).map((filename) => {
      return () => exec(`bin/seiji_translator ${filename}`);
    })
  ]);
});

gulp.task('seiji:uniseiji-font', () => exec('bin/uniseiji_font'));

gulp.task('watch', () => {
  gulp.watch(SRCS.html                                        , ['seiji:translate'    ]);
  gulp.watch(SRCS.img                                         , ['build:imagemin'     ]);
  gulp.watch(SRCS.js                                          , ['build:js'/*, 'test:js'*/]);
  gulp.watch(SRCS.sass                                        , ['build:css'          ]);
  gulp.watch(['index.php', 'lib/**/**.php', 'tests/**/**.php'], ['test:php'           ]);
});

gulp.task('default', () => exec('gulp --tasks'));

// vim:fdm=marker:
