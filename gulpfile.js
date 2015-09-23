"use strict";var _this=this;!(function(global){"use strict";var hasOwn=Object.prototype.hasOwnProperty;var undefined;var iteratorSymbol=typeof Symbol === "function" && Symbol.iterator || "@@iterator";var inModule=typeof module === "object";var runtime=global.regeneratorRuntime;if(runtime){if(inModule){module.exports = runtime;}return;}runtime = global.regeneratorRuntime = inModule?module.exports:{};function wrap(innerFn,outerFn,self,tryLocsList){var generator=Object.create((outerFn || Generator).prototype);generator._invoke = makeInvokeMethod(innerFn,self || null,new Context(tryLocsList || []));return generator;}runtime.wrap = wrap;function tryCatch(fn,obj,arg){try{return {type:"normal",arg:fn.call(obj,arg)};}catch(err) {return {type:"throw",arg:err};}}var GenStateSuspendedStart="suspendedStart";var GenStateSuspendedYield="suspendedYield";var GenStateExecuting="executing";var GenStateCompleted="completed";var ContinueSentinel={};function Generator(){}function GeneratorFunction(){}function GeneratorFunctionPrototype(){}var Gp=GeneratorFunctionPrototype.prototype = Generator.prototype;GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;GeneratorFunctionPrototype.constructor = GeneratorFunction;GeneratorFunction.displayName = "GeneratorFunction";function defineIteratorMethods(prototype){["next","throw","return"].forEach(function(method){prototype[method] = function(arg){return this._invoke(method,arg);};});}runtime.isGeneratorFunction = function(genFun){var ctor=typeof genFun === "function" && genFun.constructor;return ctor?ctor === GeneratorFunction || (ctor.displayName || ctor.name) === "GeneratorFunction":false;};runtime.mark = function(genFun){genFun.__proto__ = GeneratorFunctionPrototype;genFun.prototype = Object.create(Gp);return genFun;};runtime.awrap = function(arg){return new AwaitArgument(arg);};function AwaitArgument(arg){this.arg = arg;}function AsyncIterator(generator){function invoke(method,arg){var result=generator[method](arg);var value=result.value;return value instanceof AwaitArgument?Promise.resolve(value.arg).then(invokeNext,invokeThrow):result;}if(typeof process === "object" && process.domain){invoke = process.domain.bind(invoke);}var invokeNext=invoke.bind(generator,"next");var invokeThrow=invoke.bind(generator,"throw");var invokeReturn=invoke.bind(generator,"return");var previousPromise;function enqueue(method,arg){var enqueueResult=previousPromise?previousPromise.then(function(){return invoke(method,arg);}):new Promise(function(resolve){resolve(invoke(method,arg));});previousPromise = enqueueResult["catch"](invokeReturn);return enqueueResult;}this._invoke = enqueue;}defineIteratorMethods(AsyncIterator.prototype);runtime.async = function(innerFn,outerFn,self,tryLocsList){var iter=new AsyncIterator(wrap(innerFn,outerFn,self,tryLocsList));return runtime.isGeneratorFunction(outerFn)?iter:iter.next().then(function(result){return result.done?result.value:iter.next();});};function makeInvokeMethod(innerFn,self,context){var state=GenStateSuspendedStart;return function invoke(method,arg){if(state === GenStateExecuting){throw new Error("Generator is already running");}if(state === GenStateCompleted){return doneResult();}while(true) {var delegate=context.delegate;if(delegate){if(method === "return" || method === "throw" && delegate.iterator[method] === undefined){context.delegate = null;var returnMethod=delegate.iterator["return"];if(returnMethod){var record=tryCatch(returnMethod,delegate.iterator,arg);if(record.type === "throw"){method = "throw";arg = record.arg;continue;}}if(method === "return"){continue;}}var record=tryCatch(delegate.iterator[method],delegate.iterator,arg);if(record.type === "throw"){context.delegate = null;method = "throw";arg = record.arg;continue;}method = "next";arg = undefined;var info=record.arg;if(info.done){context[delegate.resultName] = info.value;context.next = delegate.nextLoc;}else {state = GenStateSuspendedYield;return info;}context.delegate = null;}if(method === "next"){if(state === GenStateSuspendedYield){context.sent = arg;}else {delete context.sent;}}else if(method === "throw"){if(state === GenStateSuspendedStart){state = GenStateCompleted;throw arg;}if(context.dispatchException(arg)){method = "next";arg = undefined;}}else if(method === "return"){context.abrupt("return",arg);}state = GenStateExecuting;var record=tryCatch(innerFn,self,context);if(record.type === "normal"){state = context.done?GenStateCompleted:GenStateSuspendedYield;var info={value:record.arg,done:context.done};if(record.arg === ContinueSentinel){if(context.delegate && method === "next"){arg = undefined;}}else {return info;}}else if(record.type === "throw"){state = GenStateCompleted;method = "throw";arg = record.arg;}}};}defineIteratorMethods(Gp);Gp[iteratorSymbol] = function(){return this;};Gp.toString = function(){return "[object Generator]";};function pushTryEntry(locs){var entry={tryLoc:locs[0]};if(1 in locs){entry.catchLoc = locs[1];}if(2 in locs){entry.finallyLoc = locs[2];entry.afterLoc = locs[3];}this.tryEntries.push(entry);}function resetTryEntry(entry){var record=entry.completion || {};record.type = "normal";delete record.arg;entry.completion = record;}function Context(tryLocsList){this.tryEntries = [{tryLoc:"root"}];tryLocsList.forEach(pushTryEntry,this);this.reset();}runtime.keys = function(object){var keys=[];for(var key in object) {keys.push(key);}keys.reverse();return function next(){while(keys.length) {var key=keys.pop();if(key in object){next.value = key;next.done = false;return next;}}next.done = true;return next;};};function values(iterable){if(iterable){var iteratorMethod=iterable[iteratorSymbol];if(iteratorMethod){return iteratorMethod.call(iterable);}if(typeof iterable.next === "function"){return iterable;}if(!isNaN(iterable.length)){var i=-1,next=function next(){while(++i < iterable.length) {if(hasOwn.call(iterable,i)){next.value = iterable[i];next.done = false;return next;}}next.value = undefined;next.done = true;return next;};return next.next = next;}}return {next:doneResult};}runtime.values = values;function doneResult(){return {value:undefined,done:true};}Context.prototype = {constructor:Context,reset:function reset(){this.prev = 0;this.next = 0;this.sent = undefined;this.done = false;this.delegate = null;this.tryEntries.forEach(resetTryEntry);for(var tempIndex=0,tempName;hasOwn.call(this,tempName = "t" + tempIndex) || tempIndex < 20;++tempIndex) {this[tempName] = null;}},stop:function stop(){this.done = true;var rootEntry=this.tryEntries[0];var rootRecord=rootEntry.completion;if(rootRecord.type === "throw"){throw rootRecord.arg;}return this.rval;},dispatchException:function dispatchException(exception){if(this.done){throw exception;}var context=this;function handle(loc,caught){record.type = "throw";record.arg = exception;context.next = loc;return !!caught;}for(var i=this.tryEntries.length - 1;i >= 0;--i) {var entry=this.tryEntries[i];var record=entry.completion;if(entry.tryLoc === "root"){return handle("end");}if(entry.tryLoc <= this.prev){var hasCatch=hasOwn.call(entry,"catchLoc");var hasFinally=hasOwn.call(entry,"finallyLoc");if(hasCatch && hasFinally){if(this.prev < entry.catchLoc){return handle(entry.catchLoc,true);}else if(this.prev < entry.finallyLoc){return handle(entry.finallyLoc);}}else if(hasCatch){if(this.prev < entry.catchLoc){return handle(entry.catchLoc,true);}}else if(hasFinally){if(this.prev < entry.finallyLoc){return handle(entry.finallyLoc);}}else {throw new Error("try statement without catch or finally");}}}},abrupt:function abrupt(type,arg){for(var i=this.tryEntries.length - 1;i >= 0;--i) {var entry=this.tryEntries[i];if(entry.tryLoc <= this.prev && hasOwn.call(entry,"finallyLoc") && this.prev < entry.finallyLoc){var finallyEntry=entry;break;}}if(finallyEntry && (type === "break" || type === "continue") && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc){finallyEntry = null;}var record=finallyEntry?finallyEntry.completion:{};record.type = type;record.arg = arg;if(finallyEntry){this.next = finallyEntry.finallyLoc;}else {this.complete(record);}return ContinueSentinel;},complete:function complete(record,afterLoc){if(record.type === "throw"){throw record.arg;}if(record.type === "break" || record.type === "continue"){this.next = record.arg;}else if(record.type === "return"){this.rval = record.arg;this.next = "end";}else if(record.type === "normal" && afterLoc){this.next = afterLoc;}},finish:function finish(finallyLoc){for(var i=this.tryEntries.length - 1;i >= 0;--i) {var entry=this.tryEntries[i];if(entry.finallyLoc === finallyLoc){this.complete(entry.completion,entry.afterLoc);resetTryEntry(entry);return ContinueSentinel;}}},"catch":function _catch(tryLoc){for(var i=this.tryEntries.length - 1;i >= 0;--i) {var entry=this.tryEntries[i];if(entry.tryLoc === tryLoc){var record=entry.completion;if(record.type === "throw"){var thrown=record.arg;resetTryEntry(entry);}return thrown;}}throw new Error("illegal catch attempt");},delegateYield:function delegateYield(iterable,resultName,nextLoc){this.delegate = {iterator:values(iterable),resultName:resultName,nextLoc:nextLoc};return ContinueSentinel;}};})(typeof global === "object"?global:typeof window === "object"?window:typeof self === "object"?self:undefined);'use strict';var cp=require('child_process'),fs=require('fs');var del=require('del'),glob=require('glob'),gulp=require('gulp'),autoprefixer=require('gulp-autoprefixer'),concat=require('gulp-concat'),cssBase64=require('gulp-css-base64'),imagemin=require('gulp-imagemin'),jscs=require('gulp-jscs'),jshint=require('gulp-jshint'),less=require('gulp-less'),plumber=require('gulp-plumber'),uglify=require('gulp-uglify'),webpack=require('gulp-webpack'),merge=require('merge-stream'),runSequence=require('run-sequence'),Ssh=require('simple-ssh'),Webpack=require('webpack');var SRCS={html:'lib/views/**/**.html',img:'src/images/**/**',js:['*.esnext.js','src/javascripts/**/**.js']};glob = promisify(glob);function promisify(func){return function(){for(var _len=arguments.length,args=Array(_len),_key=0;_key < _len;_key++) {args[_key] = arguments[_key];}var me=this;return new Promise(function(resolve,reject){function done(err){if(err){return reject(err);}for(var _len2=arguments.length,args=Array(_len2 > 1?_len2 - 1:0),_key2=1;_key2 < _len2;_key2++) {args[_key2 - 1] = arguments[_key2];}resolve.apply(me,args);}args.push(done);func.apply(me,args);});};}function promiseSequence(defrreds){return defrreds.reduce(function(promise,defrred){return promise.then(defrred);},Promise.resolve(null));}function exec(cmd){return new Promise(function(resolve,reject){cp.exec(cmd,function(err,stdout,stderr){console.log(stdout);if(err){console.error(stderr);return reject(err);}resolve();});});}function spawn(cmd,options){var proc=cp.spawn(cmd,options,{stdio:'inherit'});return new Promise(function(resolve,reject){proc.on('exit',function(code){if(0 !== code){return reject(new Error(cmd + ' ' + options.join(' ') + ' ends with ' + code));}resolve();}).on('error',function(err){return reject(err);});});}gulp.task('build',['clean'],function(done){return runSequence(['build:copy-assets','build:imagemin','build:js','build:css'],'seiji',done);});gulp.task('build:copy-assets',function(){function build(src){var dest=arguments.length <= 1 || arguments[1] === undefined?'':arguments[1];return gulp.src(src).pipe(gulp.dest('assets' + dest));}return merge([build(['src/fonts/Yuraru ru Soin 01\'.ttf','src/bower_components/TAKETORI-JS/taketori.js','src/bower_components/TAKETORI-JS/taketori.css']),build(['src/bower_components/font-awsome/css/font-awesome.min.css','src/bower_components/font-awsome/fonts/*'],'/fonts')]);});gulp.task('build:css',function(){gulp.src(['src/stylesheets/**/!(_)**.less']).pipe(plumber()).pipe(less({compress:true})).pipe(autoprefixer({browsers:['last 2 version']})).pipe(cssBase64({baseDir:'.',maxWeightResource:32768 * 4})).pipe(gulp.dest('assets'));});gulp.task('build:imagemin',function(){return gulp.src(SRCS.img).pipe(imagemin({optimizationLevel:7,progressive:true})).pipe(gulp.dest('assets'));});gulp.task('build:js',function(){function build(src,dest){var entry=Array.isArray(src)?src[src.length - 1]:src;if(void 0 === dest){dest = entry.slice('src/javascripts/'.length);}return gulp.src(src).pipe(plumber()).pipe(webpack({module:{entry:entry,output:dest,resolve:{extensions:['','.js'],modulesDirectories:['node_modules','bower_components'],alias:{}},plugins:[new Webpack.ResolverPlugin(new Webpack.ResolverPlugin.DirectoryDescriptionFilePlugin('bower.json',['main'])),new Webpack.optimize.DedupePlugin(),new Webpack.optimize.AggressiveMergingPlugin(),new Webpack.ProvidePlugin({jQuery:'jquery',$:'jquery',jquery:'jquery'})],loaders:[{test:/\.js$/,exclude:/node_modules/,loader:'babel-loader'}]}})).pipe(concat(dest)).pipe(gulp.dest('assets'));}return merge([build('src/javascripts/layout.js'),build('src/javascripts/index.js'),build('src/javascripts/feed.js'),build('src/javascripts/vertical_latin.js'),build(['src/bower_components/regenerator/runtime.js','src/javascripts/funisaya/world/main.js'],'funisaya/world.js')]);});gulp.task('clean',function(){return del(['assets/+(!.keep|**)']).then(function(paths){return console.log('Del ' + paths.join(', '));});});gulp.task('deploy',['build'],function callee$0$0(){var ssh,sshExec;return regeneratorRuntime.async(function callee$0$0$(context$1$0){while(1) switch(context$1$0.prev = context$1$0.next){case 0:sshExec = function sshExec(cmd){return new Promise(function(resolve,reject){ssh.exec(cmd,{out:function out(stdout){return console.log(stdout);},err:function err(stderr){return console.error(stderr);}}).on('end',function(){return resolve();}).start();});};ssh = new Ssh({agentForward:true,key:fs.readFileSync(process.env.HOME + '/.ssh/id_rsa'),host:'c4se2.sakura.ne.jp',port:22,user:'c4se2'});context$1$0.next = 4;return regeneratorRuntime.awrap(sshExec('cd ~/www;' + 'git pull --ff-only origin master;' + 'composer install --no-dev;' + ''));case 4:return context$1$0.abrupt("return",exec('rsync -azh --delete --stats assets c4se2@c4se2.sakura.ne.jp:/home/c4se2/www'));case 5:case "end":return context$1$0.stop();}},null,_this);});gulp.task('test',['test:js','test:php']);gulp.task('test:js',['test:js:jscs','test:js:jshint']);gulp.task('test:js:jscs',function(){return gulp.src(SRCS.js).pipe(jscs());});gulp.task('test:js:jshint',function(){return gulp.src(SRCS.js).pipe(jshint()).pipe(jshint.reporter('default'));});gulp.task('test:php',function(){return exec('vendor/bin/phing test');});gulp.task('seiji',function(done){return runSequence(['seiji:translate','seiji:uniseiji-font'],'seiji:propose',done);});gulp.task('seiji:propose',function callee$0$0(){return regeneratorRuntime.async(function callee$0$0$(context$1$0){while(1) switch(context$1$0.prev = context$1$0.next){case 0:context$1$0.next = 2;return regeneratorRuntime.awrap(glob(SRCS.html));case 2:context$1$0.t0 = function(filename){return function(){return spawn('bin/seiji_proposer',[filename]);};};context$1$0.t1 = context$1$0.sent.map(context$1$0.t0);return context$1$0.abrupt("return",promiseSequence(context$1$0.t1));case 5:case "end":return context$1$0.stop();}},null,_this);});gulp.task('seiji:translate',function callee$0$0(){return regeneratorRuntime.async(function callee$0$0$(context$1$0){while(1) switch(context$1$0.prev = context$1$0.next){case 0:context$1$0.t0 = Promise;context$1$0.next = 3;return regeneratorRuntime.awrap(glob(SRCS.html));case 3:context$1$0.t1 = function(filename){return function(){return exec("bin/seiji_translator " + filename);};};context$1$0.t2 = context$1$0.sent.map(context$1$0.t1);context$1$0.t3 = [context$1$0.t2];return context$1$0.abrupt("return",context$1$0.t0.all.call(context$1$0.t0,context$1$0.t3));case 7:case "end":return context$1$0.stop();}},null,_this);});gulp.task('seiji:uniseiji-font',function(){return exec('bin/uniseiji_font');});gulp.task('watch',function(){gulp.watch(SRCS.html,['seiji:translate']);gulp.watch(SRCS.img,['build:imagemin']);gulp.watch(SRCS.js,['build:js']);gulp.watch('src/stylesheets/**/**.less',['build:css']);gulp.watch(['index.php','lib/**/**.php','tests/**/**.php'],['test:php']);});gulp.task('default',function(){console.log('Use bin/gulp');return exec('bin/gulp --tasks');});
