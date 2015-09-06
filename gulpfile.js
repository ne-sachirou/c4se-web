'use strict';var cp=require('child_process'),fs=require('fs');var del=require('del'),glob=require('glob'),gulp=require('gulp'),autoprefixer=require('gulp-autoprefixer'),babel=require('gulp-babel'),concat=require('gulp-concat'),cssBase64=require('gulp-css-base64'),imagemin=require('gulp-imagemin'),jscs=require('gulp-jscs'),jshint=require('gulp-jshint'),less=require('gulp-less'),plumber=require('gulp-plumber'),run=require('gulp-run'),uglify=require('gulp-uglifyjs'),merge=require('merge-stream'),runSequence=require('run-sequence'),Ssh=require('simple-ssh');var SRCS={html:'lib/views/**/**.html',img:'src/images/**/**',js:['*.esnext.js','src/javascripts/**/**.js']};function promiseSequence(defrreds){return defrreds.reduce(function(promise,defrred){return promise.then(defrred);},Promise.resolve(null));}function promissExec(cmd){return new Promise(function(resolve,reject){cp.exec(cmd,function(err,stdout,stderr){console.log(stdout);if(err){console.error(stderr);return reject(err);}resolve();});});}function promiseSpawn(cmd,options){var proc=cp.spawn(cmd,options);function sendInput(){var chunk=process.stdin.read();if(null === chunk){return;}proc.stdin.write(chunk);}proc.stdout.on('data',function(chunk){return process.stdout.write(chunk);});proc.stderr.on('data',function(chunk){process.stderr.write(chunk);});process.stdin.setEncoding('utf8');process.stdin.on('readable',sendInput);return new Promise(function(resolve,reject){proc.on('close',function(code){proc.stdin.end();process.stdin.removeListener('readable',sendInput);if(0 !== code){return reject(new Error(cmd + ' ' + options.join(' ') + ' ends with ' + code));}resolve();}).on('error',function(err){return reject(err);});});}gulp.task('clean',function(done){del(['assets/**'],function(err,paths){if(err){return done(err);}console.log('Del ' + paths.join(', '));done();});});gulp.task('copy-assets',function(){return merge([{src:['src/fonts/Yuraru ru Soin 01\'.ttf','src/bower_components/TAKETORI-JS/taketori.js','src/bower_components/TAKETORI-JS/taketori.css'],dest:''},{src:['src/bower_components/font-awsome/css/font-awesome.min.css','src/bower_components/font-awsome/fonts/*'],dest:'/fonts'}].map(function(set){return gulp.src(set.src).pipe(gulp.dest('assets' + set.dest));}));});gulp.task('deploy',function(done){var ssh=new Ssh({agentForward:true,key:fs.readFileSync(process.env.HOME + '/.ssh/id_rsa'),host:'c4se2.sakura.ne.jp',port:22,user:'c4se2'}),cmd='cd ~/www;' + 'git pull --ff-only origin master;' + 'composer install --no-dev;' + '';ssh.exec(cmd,{out:function out(stdout){return console.log(stdout);},err:function err(stderr){return console.error(stderr);}}).on('end',function(){return done();}).start();});gulp.task('imagemin',function(){return gulp.src(SRCS.img).pipe(imagemin({optimizationLevel:7,progressive:true})).pipe(gulp.dest('assets'));});gulp.task('js-build',function(){return merge([{src:['src/javascripts/_baselib.js','src/javascripts/layout.js'],dest:'layout.js'},{src:['src/javascripts/_baselib.js','src/javascripts/_wavable.js','src/javascripts/index.js'],dest:'index.js'},{src:['src/javascripts/_baselib.js','src/javascripts/feed.js'],dest:'feed.js'},{src:['src/javascripts/_baselib.js','src/javascripts/vertical_latin.js'],dest:'vertical_latin.js'}].map(function(set){return gulp.src(set.src).pipe(plumber()).pipe(babel({modules:'umd'})).pipe(concat(set.dest)).pipe(uglify({output:{},compress:{unsafe:true}})).pipe(gulp.dest('assets'));}));});gulp.task('jscs',function(){return gulp.src(SRCS.js).pipe(jscs());});gulp.task('jshint',function(){return gulp.src(SRCS.js).pipe(jshint()).pipe(jshint.reporter('default'));});gulp.task('css-build',function(){gulp.src(['src/stylesheets/**/!(_)**.less']).pipe(plumber()).pipe(less({compress:true,sourceMap:true})).pipe(autoprefixer({browsers:['last 2 version']})).pipe(cssBase64({baseDir:'.',maxWeightResource:32768 * 4})).pipe(gulp.dest('assets'));});gulp.task('php-test',function(){return promissExec('vendor/bin/phing test');});gulp.task('seiji-propose',function(done){glob(SRCS.html,function(err,matches){if(err){return done(err);}promiseSequence(matches.map(function(filename){return function(){return promiseSpawn('bin/seiji_proposer',[filename]);};})).then(function(){return done();})['catch'](function(err){console.error(err);done(err);});});});gulp.task('seiji-translate',function(){return gulp.src(SRCS.html).pipe(run('bin/seiji_translator',{silent:true})).pipe(gulp.dest('lib/views'));});gulp.task('seiji-uniseiji-font',function(){return promissExec('bin/uniseiji_font');});gulp.task('watch',function(){gulp.watch(SRCS.html,['seiji-translate']);gulp.watch(SRCS.img,['imagemin']);gulp.watch(SRCS.js,['js-build','js-test']);gulp.watch('src/stylesheets/**/**.less',['less']);gulp.watch(['index.php','lib/**/**.php','tests/**/**.php'],['php-test']);});gulp.task('build',function(done){return runSequence(['copy-assets','imagemin','js-build','css-build'],'seiji',done);});gulp.task('js-test',['jscs','jshint']);gulp.task('seiji',function(done){return runSequence(['seiji-translate','seiji-uniseiji-font'],'seiji-propose',done);});gulp.task('test',['js-test','php-test']);
