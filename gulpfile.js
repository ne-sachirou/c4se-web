/* jshint node:true */
'use strict';
var cp = require('child_process'),
    fs = require('fs');
var co       = require('co'),
    ssh      = require('co-ssh'),
    del      = require('del'),
    glob     = require('glob'),
    gulp     = require('gulp'),
    concat   = require('gulp-concat'),
    imagemin = require('gulp-imagemin'),
    jscs     = require('gulp-jscs'),
    jshint   = require('gulp-jshint'),
    less     = require('gulp-less'),
    traceur  = require('gulp-traceur'),
    uglify   = require('gulp-uglifyjs'),
    merge    = require('merge-stream'),
    through  = require('through2');
var SRCS = {
      html: 'src/views/**/**.html',
      img : 'src/images/*',
      js  : ['*.js', 'src/javascripts/**/**.js'],
    };

  // {{{ Util
function promissExec(cmd) {
  return new Promise(function (resolve, reject) {
    cp.exec(cmd, function (err, stdout, stderr) {
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
  var proc = cp.spawn(cmd, options);

  function sendInput() {
    var chunk = process.stdin.read();
    if (null === chunk) {
      return;
    }
    proc.stdin.write(chunk);
  }

  proc.stdout.on('data', function (chunk) {
    process.stdout.write(chunk);
  });
  proc.stderr.on('data', function (chunk) {
    process.stderr.write(chunk);
  });
  process.stdin.on('readable', sendInput);
  return new Promise(function (resolve, reject) {
    proc.on('close', function (code) {
      proc.stdin.end();
      process.stdin.removeListener('readable', sendInput);
      if (0 !== code) {
        return reject(new Error(cmd + ' ' + options.join(' ') + ' ends with ' + code));
      }
      resolve();
    }).on('error', function (err) {
      reject(err);
    });
  });
}

function execPipe(cmd, options) {
  options = options || [];
  return through.obj(function (file, encoding, callback) {
    var me      = this,
        proc    = cp.spawn(cmd, options),
        stdouts = [];
    proc.on('close', function (code) {
      if (0 !== code) {
        me.emit('error', new Error(cmd + ' ' + options.join(' ') + ' ends with ' + code));
        return callback();
      }
      file.contents = Buffer.concat(stdouts);
      me.push(file);
      callback();
    }).on('error', function (err) {
      me.emit('error', err);
    });
    proc.stdout.on('data', function (chunk) {
      stdouts.push(chunk);
    });
    proc.stderr.on('data', function (chunk) {
      process.stderr.write(chunk);
    });
    proc.stdin.write(file.contents.toString(encoding));
    proc.stdin.end();
  });
}
// }}}

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
  ].map(function (set) {
    return gulp.src(set.src).pipe(gulp.dest('lib/assets' + set.dest));
  }));
});

gulp.task('deploy', function () {
  return co(function* () {
    var conn = ssh({
      key  : fs.readFileSync(process.env.HOME + '/.ssh/id_rsa'),
      host : 'c4se2.sakura.ne.jp',
      port : 22,
      user : 'c4se2',
    });
    yield conn.connect();
    yield conn.exec('cd ~/www; git pull --ff-only origin master');
    yield conn.exec('cd ~/www; composer install --no-dev');
    // yield conn.exec('cd ~/www; set SERVER_ENV=production; vendor/bin/phpmig migrate');
  });
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
  gulp.src(['src/stylesheets/**/!(_)**.less']).
    pipe(less({
      compress  : true,
      sourceMap : true,
    })).
    pipe(gulp.dest('lib/assets'));
});

gulp.task('php-test', function () {
  return promissExec('vendor/bin/phing test');
});

// This must not be done async.
gulp.task('seiji-propose', function (done) {
  process.stdin.setEncoding('utf8');
  glob(SRCS.html, function (err, matches) {
    if (err) {
      return done(err);
    }
    matches.reduce(function (promise, filename) {
      return promise.then(function () {
        return promiseSpawn('bin/seiji_proposer', [filename]);
      });
    }, Promise.resolve(null)).
      then(function () {
        done();
      }).
      catch(function (err) {
        console.error(err);
        done(err);
      });
  });
});

gulp.task('seiji-translate', function () {
  return gulp.src(SRCS.html).
    pipe(execPipe('bin/seiji_translator')).
    pipe(gulp.dest('src/views'));
});

gulp.task('seiji-uniseiji-font', function () {
  return promissExec('bin/uniseiji_font');
});

gulp.task('watch', function () {
  gulp.watch(SRCS.html                                        , ['seiji-translate']);
  gulp.watch(SRCS.img                                         , ['imagemin']);
  gulp.watch(SRCS.js                                          , ['js-build', 'js-test']);
  gulp.watch('src/stylesheets/*.less'                         , ['less']);
  gulp.watch(['index.php', 'lib/**/**.php', 'tests/**/**.php'], ['php-test']);
});

gulp.task('build',   ['copy-assets', 'imagemin', 'js-build', 'less', 'seiji']);
gulp.task('js-test', ['jscs', 'jshint']);
gulp.task('seiji',   ['seiji-propose', 'seiji-translate', 'seiji-uniseiji-font']);
gulp.task('test',    ['js-test', 'php-test']);

// vim:fdm=marker:
