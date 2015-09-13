(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports);
    global.runtime = mod.exports;
  }
})(this, function (exports) {
  /**
   * Copyright (c) 2014, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the BSD-style license found in the
   * https://raw.github.com/facebook/regenerator/master/LICENSE file. An
   * additional grant of patent rights can be found in the PATENTS file in
   * the same directory.
   */

  "use strict";

  !(function (global) {
    "use strict";

    var hasOwn = Object.prototype.hasOwnProperty;
    var undefined; // More compressible than void 0.
    var iteratorSymbol = typeof Symbol === "function" && Symbol.iterator || "@@iterator";

    var inModule = typeof module === "object";
    var runtime = global.regeneratorRuntime;
    if (runtime) {
      if (inModule) {
        // If regeneratorRuntime is defined globally and we're in a module,
        // make the exports object identical to regeneratorRuntime.
        module.exports = runtime;
      }
      // Don't bother evaluating the rest of this file if the runtime was
      // already defined globally.
      return;
    }

    // Define the runtime globally (as expected by generated code) as either
    // module.exports (if we're in a module) or a new, empty object.
    runtime = global.regeneratorRuntime = inModule ? module.exports : {};

    function wrap(innerFn, outerFn, self, tryLocsList) {
      // If outerFn provided, then outerFn.prototype instanceof Generator.
      var generator = Object.create((outerFn || Generator).prototype);

      generator._invoke = makeInvokeMethod(innerFn, self || null, new Context(tryLocsList || []));

      return generator;
    }
    runtime.wrap = wrap;

    // Try/catch helper to minimize deoptimizations. Returns a completion
    // record like context.tryEntries[i].completion. This interface could
    // have been (and was previously) designed to take a closure to be
    // invoked without arguments, but in all the cases we care about we
    // already have an existing method we want to call, so there's no need
    // to create a new function object. We can even get away with assuming
    // the method takes exactly one argument, since that happens to be true
    // in every case, so we don't have to touch the arguments object. The
    // only additional allocation required is the completion record, which
    // has a stable shape and so hopefully should be cheap to allocate.
    function tryCatch(fn, obj, arg) {
      try {
        return { type: "normal", arg: fn.call(obj, arg) };
      } catch (err) {
        return { type: "throw", arg: err };
      }
    }

    var GenStateSuspendedStart = "suspendedStart";
    var GenStateSuspendedYield = "suspendedYield";
    var GenStateExecuting = "executing";
    var GenStateCompleted = "completed";

    // Returning this object from the innerFn has the same effect as
    // breaking out of the dispatch switch statement.
    var ContinueSentinel = {};

    // Dummy constructor functions that we use as the .constructor and
    // .constructor.prototype properties for functions that return Generator
    // objects. For full spec compliance, you may wish to configure your
    // minifier not to mangle the names of these two functions.
    function Generator() {}
    function GeneratorFunction() {}
    function GeneratorFunctionPrototype() {}

    var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype;
    GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
    GeneratorFunctionPrototype.constructor = GeneratorFunction;
    GeneratorFunction.displayName = "GeneratorFunction";

    // Helper for defining the .next, .throw, and .return methods of the
    // Iterator interface in terms of a single ._invoke method.
    function defineIteratorMethods(prototype) {
      ["next", "throw", "return"].forEach(function (method) {
        prototype[method] = function (arg) {
          return this._invoke(method, arg);
        };
      });
    }

    runtime.isGeneratorFunction = function (genFun) {
      var ctor = typeof genFun === "function" && genFun.constructor;
      return ctor ? ctor === GeneratorFunction ||
      // For the native GeneratorFunction constructor, the best we can
      // do is to check its .name property.
      (ctor.displayName || ctor.name) === "GeneratorFunction" : false;
    };

    runtime.mark = function (genFun) {
      genFun.__proto__ = GeneratorFunctionPrototype;
      genFun.prototype = Object.create(Gp);
      return genFun;
    };

    // Within the body of any async function, `await x` is transformed to
    // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
    // `value instanceof AwaitArgument` to determine if the yielded value is
    // meant to be awaited. Some may consider the name of this method too
    // cutesy, but they are curmudgeons.
    runtime.awrap = function (arg) {
      return new AwaitArgument(arg);
    };

    function AwaitArgument(arg) {
      this.arg = arg;
    }

    function AsyncIterator(generator) {
      // This invoke function is written in a style that assumes some
      // calling function (or Promise) will handle exceptions.
      function invoke(method, arg) {
        var result = generator[method](arg);
        var value = result.value;
        return value instanceof AwaitArgument ? Promise.resolve(value.arg).then(invokeNext, invokeThrow) : result;
      }

      if (typeof process === "object" && process.domain) {
        invoke = process.domain.bind(invoke);
      }

      var invokeNext = invoke.bind(generator, "next");
      var invokeThrow = invoke.bind(generator, "throw");
      var invokeReturn = invoke.bind(generator, "return");
      var previousPromise;

      function enqueue(method, arg) {
        var enqueueResult =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(function () {
          return invoke(method, arg);
        }) : new Promise(function (resolve) {
          resolve(invoke(method, arg));
        });

        // Avoid propagating enqueueResult failures to Promises returned by
        // later invocations of the iterator, and call generator.return() to
        // allow the generator a chance to clean up.
        previousPromise = enqueueResult["catch"](invokeReturn);

        return enqueueResult;
      }

      // Define the unified helper method that is used to implement .next,
      // .throw, and .return (see defineIteratorMethods).
      this._invoke = enqueue;
    }

    defineIteratorMethods(AsyncIterator.prototype);

    // Note that simple async functions are implemented on top of
    // AsyncIterator objects; they just return a Promise for the value of
    // the final result produced by the iterator.
    runtime.async = function (innerFn, outerFn, self, tryLocsList) {
      var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList));

      return runtime.isGeneratorFunction(outerFn) ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function (result) {
        return result.done ? result.value : iter.next();
      });
    };

    function makeInvokeMethod(innerFn, self, context) {
      var state = GenStateSuspendedStart;

      return function invoke(method, arg) {
        if (state === GenStateExecuting) {
          throw new Error("Generator is already running");
        }

        if (state === GenStateCompleted) {
          // Be forgiving, per 25.3.3.3.3 of the spec:
          // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
          return doneResult();
        }

        while (true) {
          var delegate = context.delegate;
          if (delegate) {
            if (method === "return" || method === "throw" && delegate.iterator[method] === undefined) {
              // A return or throw (when the delegate iterator has no throw
              // method) always terminates the yield* loop.
              context.delegate = null;

              // If the delegate iterator has a return method, give it a
              // chance to clean up.
              var returnMethod = delegate.iterator["return"];
              if (returnMethod) {
                var record = tryCatch(returnMethod, delegate.iterator, arg);
                if (record.type === "throw") {
                  // If the return method threw an exception, let that
                  // exception prevail over the original return or throw.
                  method = "throw";
                  arg = record.arg;
                  continue;
                }
              }

              if (method === "return") {
                // Continue with the outer return, now that the delegate
                // iterator has been terminated.
                continue;
              }
            }

            var record = tryCatch(delegate.iterator[method], delegate.iterator, arg);

            if (record.type === "throw") {
              context.delegate = null;

              // Like returning generator.throw(uncaught), but without the
              // overhead of an extra function call.
              method = "throw";
              arg = record.arg;
              continue;
            }

            // Delegate generator ran and handled its own exceptions so
            // regardless of what the method was, we continue as if it is
            // "next" with an undefined arg.
            method = "next";
            arg = undefined;

            var info = record.arg;
            if (info.done) {
              context[delegate.resultName] = info.value;
              context.next = delegate.nextLoc;
            } else {
              state = GenStateSuspendedYield;
              return info;
            }

            context.delegate = null;
          }

          if (method === "next") {
            if (state === GenStateSuspendedYield) {
              context.sent = arg;
            } else {
              delete context.sent;
            }
          } else if (method === "throw") {
            if (state === GenStateSuspendedStart) {
              state = GenStateCompleted;
              throw arg;
            }

            if (context.dispatchException(arg)) {
              // If the dispatched exception was caught by a catch block,
              // then let that catch block handle the exception normally.
              method = "next";
              arg = undefined;
            }
          } else if (method === "return") {
            context.abrupt("return", arg);
          }

          state = GenStateExecuting;

          var record = tryCatch(innerFn, self, context);
          if (record.type === "normal") {
            // If an exception is thrown from innerFn, we leave state ===
            // GenStateExecuting and loop back for another invocation.
            state = context.done ? GenStateCompleted : GenStateSuspendedYield;

            var info = {
              value: record.arg,
              done: context.done
            };

            if (record.arg === ContinueSentinel) {
              if (context.delegate && method === "next") {
                // Deliberately forget the last sent value so that we don't
                // accidentally pass it on to the delegate.
                arg = undefined;
              }
            } else {
              return info;
            }
          } else if (record.type === "throw") {
            state = GenStateCompleted;
            // Dispatch the exception by looping back around to the
            // context.dispatchException(arg) call above.
            method = "throw";
            arg = record.arg;
          }
        }
      };
    }

    // Define Generator.prototype.{next,throw,return} in terms of the
    // unified ._invoke helper method.
    defineIteratorMethods(Gp);

    Gp[iteratorSymbol] = function () {
      return this;
    };

    Gp.toString = function () {
      return "[object Generator]";
    };

    function pushTryEntry(locs) {
      var entry = { tryLoc: locs[0] };

      if (1 in locs) {
        entry.catchLoc = locs[1];
      }

      if (2 in locs) {
        entry.finallyLoc = locs[2];
        entry.afterLoc = locs[3];
      }

      this.tryEntries.push(entry);
    }

    function resetTryEntry(entry) {
      var record = entry.completion || {};
      record.type = "normal";
      delete record.arg;
      entry.completion = record;
    }

    function Context(tryLocsList) {
      // The root entry object (effectively a try statement without a catch
      // or a finally block) gives us a place to store values thrown from
      // locations where there is no enclosing try statement.
      this.tryEntries = [{ tryLoc: "root" }];
      tryLocsList.forEach(pushTryEntry, this);
      this.reset();
    }

    runtime.keys = function (object) {
      var keys = [];
      for (var key in object) {
        keys.push(key);
      }
      keys.reverse();

      // Rather than returning an object with a next method, we keep
      // things simple and return the next function itself.
      return function next() {
        while (keys.length) {
          var key = keys.pop();
          if (key in object) {
            next.value = key;
            next.done = false;
            return next;
          }
        }

        // To avoid creating an additional object, we just hang the .value
        // and .done properties off the next function object itself. This
        // also ensures that the minifier will not anonymize the function.
        next.done = true;
        return next;
      };
    };

    function values(iterable) {
      if (iterable) {
        var iteratorMethod = iterable[iteratorSymbol];
        if (iteratorMethod) {
          return iteratorMethod.call(iterable);
        }

        if (typeof iterable.next === "function") {
          return iterable;
        }

        if (!isNaN(iterable.length)) {
          var i = -1,
              next = function next() {
            while (++i < iterable.length) {
              if (hasOwn.call(iterable, i)) {
                next.value = iterable[i];
                next.done = false;
                return next;
              }
            }

            next.value = undefined;
            next.done = true;

            return next;
          };

          return next.next = next;
        }
      }

      // Return an iterator with no values.
      return { next: doneResult };
    }
    runtime.values = values;

    function doneResult() {
      return { value: undefined, done: true };
    }

    Context.prototype = {
      constructor: Context,

      reset: function reset() {
        this.prev = 0;
        this.next = 0;
        this.sent = undefined;
        this.done = false;
        this.delegate = null;

        this.tryEntries.forEach(resetTryEntry);

        // Pre-initialize at least 20 temporary variables to enable hidden
        // class optimizations for simple generators.
        for (var tempIndex = 0, tempName; hasOwn.call(this, tempName = "t" + tempIndex) || tempIndex < 20; ++tempIndex) {
          this[tempName] = null;
        }
      },

      stop: function stop() {
        this.done = true;

        var rootEntry = this.tryEntries[0];
        var rootRecord = rootEntry.completion;
        if (rootRecord.type === "throw") {
          throw rootRecord.arg;
        }

        return this.rval;
      },

      dispatchException: function dispatchException(exception) {
        if (this.done) {
          throw exception;
        }

        var context = this;
        function handle(loc, caught) {
          record.type = "throw";
          record.arg = exception;
          context.next = loc;
          return !!caught;
        }

        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          var record = entry.completion;

          if (entry.tryLoc === "root") {
            // Exception thrown outside of any try block that could handle
            // it, so set the completion value of the entire function to
            // throw the exception.
            return handle("end");
          }

          if (entry.tryLoc <= this.prev) {
            var hasCatch = hasOwn.call(entry, "catchLoc");
            var hasFinally = hasOwn.call(entry, "finallyLoc");

            if (hasCatch && hasFinally) {
              if (this.prev < entry.catchLoc) {
                return handle(entry.catchLoc, true);
              } else if (this.prev < entry.finallyLoc) {
                return handle(entry.finallyLoc);
              }
            } else if (hasCatch) {
              if (this.prev < entry.catchLoc) {
                return handle(entry.catchLoc, true);
              }
            } else if (hasFinally) {
              if (this.prev < entry.finallyLoc) {
                return handle(entry.finallyLoc);
              }
            } else {
              throw new Error("try statement without catch or finally");
            }
          }
        }
      },

      abrupt: function abrupt(type, arg) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) {
            var finallyEntry = entry;
            break;
          }
        }

        if (finallyEntry && (type === "break" || type === "continue") && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc) {
          // Ignore the finally entry if control is not jumping to a
          // location outside the try/catch block.
          finallyEntry = null;
        }

        var record = finallyEntry ? finallyEntry.completion : {};
        record.type = type;
        record.arg = arg;

        if (finallyEntry) {
          this.next = finallyEntry.finallyLoc;
        } else {
          this.complete(record);
        }

        return ContinueSentinel;
      },

      complete: function complete(record, afterLoc) {
        if (record.type === "throw") {
          throw record.arg;
        }

        if (record.type === "break" || record.type === "continue") {
          this.next = record.arg;
        } else if (record.type === "return") {
          this.rval = record.arg;
          this.next = "end";
        } else if (record.type === "normal" && afterLoc) {
          this.next = afterLoc;
        }
      },

      finish: function finish(finallyLoc) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          if (entry.finallyLoc === finallyLoc) {
            this.complete(entry.completion, entry.afterLoc);
            resetTryEntry(entry);
            return ContinueSentinel;
          }
        }
      },

      "catch": function _catch(tryLoc) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          if (entry.tryLoc === tryLoc) {
            var record = entry.completion;
            if (record.type === "throw") {
              var thrown = record.arg;
              resetTryEntry(entry);
            }
            return thrown;
          }
        }

        // The context.catch method must only be called with a location
        // argument that corresponds to a known catch block.
        throw new Error("illegal catch attempt");
      },

      delegateYield: function delegateYield(iterable, resultName, nextLoc) {
        this.delegate = {
          iterator: values(iterable),
          resultName: resultName,
          nextLoc: nextLoc
        };

        return ContinueSentinel;
      }
    };
  })(
  // Among the various tricks for obtaining a reference to the global
  // object, this seems to be the most reliable technique that does not
  // use indirect eval (which violates Content Security Policy).
  typeof global === "object" ? global : typeof window === "object" ? window : typeof self === "object" ? self : undefined);
});
(function (global, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['exports'], factory);
  } else if (typeof exports !== 'undefined') {
    factory(exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports);
    global.ResourceLoader = mod.exports;
  }
})(this, function (exports) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var Resource = function Resource(ner) {
    _classCallCheck(this, Resource);

    this.ner = ner;
    this.resource = null;
  };

  var ImageResource = (function (_Resource) {
    _inherits(ImageResource, _Resource);

    function ImageResource() {
      _classCallCheck(this, ImageResource);

      _get(Object.getPrototypeOf(ImageResource.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(ImageResource, [{
      key: 'load',
      value: function load() {
        var _this = this;

        var image = new Image();
        return new Promise(function (resolve, reject) {
          image.onload = function () {
            _this.resource = image;
            resolve(_this);
          };
          image.onerror = function () {
            return reject();
          };
          image.src = '/assets/funisaya/world/' + _this.ner;
        });
      }
    }]);

    return ImageResource;
  })(Resource);

  var AudioResource = (function (_Resource2) {
    _inherits(AudioResource, _Resource2);

    function AudioResource() {
      _classCallCheck(this, AudioResource);

      _get(Object.getPrototypeOf(AudioResource.prototype), 'constructor', this).apply(this, arguments);
    }

    _createClass(AudioResource, [{
      key: 'load',
      value: function load() {
        var _this2 = this;

        return new Promise(function (resolve, reject) {
          resolve(_this2);
        });
      }
    }]);

    return AudioResource;
  })(Resource);

  var ResourceLoader = (function () {
    function ResourceLoader() {
      _classCallCheck(this, ResourceLoader);

      if (ResourceLoader._instance) {
        return ResourceLoader._instance;
      }
      ResourceLoader._instance = this;
      this.resources = {};
    }

    _createClass(ResourceLoader, [{
      key: 'loadSet',
      value: function loadSet(ner) {
        var _this3 = this;

        return Promise.all(ResourceLoader.resourceSets[ner].map(function (resource) {
          if (_this3.resources[resource.ner]) {
            return Promise.resolve(_this3.resources[resource.ner]);
          } else {
            return resource.load().then(function () {
              _this3.resources[resource.ner] = _this3.resources[resource.ner] || resource;
              return _this3.resources[resource.ner];
            });
          }
        }));
      }
    }]);

    return ResourceLoader;
  })();

  exports.ResourceLoader = ResourceLoader;

  ResourceLoader._instance = null;

  ResourceLoader.resourceSets = {
    init: [
    // new ImageResource('CharactorFrontLeft.png'),
    new ImageResource('CharactorFrontMiddle.png'),
    // new ImageResource('CharactorFrontRight.png'),
    // new ImageResource('CharactorLeftSideLeft.png'),
    // new ImageResource('CharactorLeftSideMiddle.png'),
    // new ImageResource('CharactorLeftSideRight.png'),
    // new ImageResource('CharactorRightSideLeft.png'),
    // new ImageResource('CharactorRightSideMiddle.png'),
    // new ImageResource('CharactorRightSideRight.png'),
    new ImageResource('Dark.png')]
  };
});
(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports);
    global.Scene = mod.exports;
  }
})(this, function (exports) {
  "use strict";

  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

  var Scene = (function () {
    function Scene(world) {
      _classCallCheck(this, Scene);

      this.world = world;
    }

    _createClass(Scene, [{
      key: "destructor",
      value: function destructor() {}
    }, {
      key: "onClick",
      value: function onClick(evt) {}
    }, {
      key: "onKeyDown",
      value: function onKeyDown(evt) {}
    }, {
      key: "onKeyPress",
      value: function onKeyPress(evt) {}
    }, {
      key: "onKeyUp",
      value: function onKeyUp(evt) {}
    }]);

    return Scene;
  })();

  exports.Scene = Scene;
});
(function (global, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['exports', './ResourceLoader.js', './Scene.js'], factory);
  } else if (typeof exports !== 'undefined') {
    factory(exports, require('./ResourceLoader.js'), require('./Scene.js'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.ResourceLoader, global.Scene);
    global.FieldScene = mod.exports;
  }
})(this, function (exports, _ResourceLoaderJs, _SceneJs) {
  /* jssc maximumLineLength:1000 */
  /* jshint browser:true, strict:false */
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  var FieldScene = (function (_Scene) {
    _inherits(FieldScene, _Scene);

    function FieldScene(world) {
      _classCallCheck(this, FieldScene);

      _get(Object.getPrototypeOf(FieldScene.prototype), 'constructor', this).call(this, world);
      var me = this;

      function loop() {
        if (!me._isLive) {
          return;
        }
        me.draw();
        window.requestAnimationFrame(loop);
      }

      this._isLive = true;
      this._context = world.canvas.getContext('2d');
      this._zurag = null;
      this._zuragCanvas = null;
      this._zuragCanvasContext = null;
      this._charactor = new Charactor();
      if (this.world.serialized.fieldScene) {
        this._deserialize(this.world.serialized.fieldScene);
      } else {
        this.switchZurag(FieldScene.zurags.Start);
        this._charactor.moveTo(Math.floor(this._zurag.colNum / 2), Math.floor(this._zurag.rowNum / 2));
      }
      loop();
    }

    _createClass(FieldScene, [{
      key: 'destructor',
      value: function destructor() {
        this._isLive = false;
        this.world.serialized.fieldScene = this._serialize();
      }
    }, {
      key: 'draw',
      value: function draw() {
        this._zuragCanvasContext.clearRect(0, 0, this._zuragCanvas.width, this._zuragCanvas.height);
        this._zurag.drawMats(this._zuragCanvasContext);
        this._zurag.drawInteractives(this._zuragCanvasContext);
        this._charactor.draw(this._zuragCanvasContext);
        this._zurag.drawOverlays(this._zuragCanvasContext);
        this._context.clearRect(0, 0, this.world.canvas.width, this.world.canvas.height);
        {
          var transformX = this.world.canvas.width / 2 - (this._charactor.x - 24);
          var transformY = this.world.canvas.height / 2 - (this._charactor.y - 24);
          if (transformX > 0) {
            transformX = 0;
          } else if (this.world.canvas.width - transformX > this._zuragCanvas.width) {
            transformX = this.world.canvas.width - this._zuragCanvas.width;
          }
          if (transformY > 0) {
            transformY = 0;
          } else if (this.world.canvas.height - transformY > this._zuragCanvas.height) {
            transformY = this.world.canvas.height - this._zuragCanvas.height;
          }
          this._context.drawImage(this._zuragCanvas, transformX, transformY);
        }
      }
    }, {
      key: 'onKeyDown',
      value: function onKeyDown(evt) {
        var _this = this;

        var nextCol = this._charactor.col;
        var nextRow = this._charactor.row;
        var isMovable = function isMovable() {
          var nextMat = _this._zurag.mats[nextRow] ? _this._zurag.mats[nextRow][nextCol] : void 0;
          return nextMat && nextMat.isPassable;
        };
        switch (evt.keyCode) {
          case 37:
            // ←
            evt.preventDefault();
            --nextCol;
            if (isMovable()) {
              this._charactor.moveLeft();
            }
            break;
          case 38:
            // ↑
            evt.preventDefault();
            --nextRow;
            if (isMovable()) {
              this._charactor.moveUp();
            }
            break;
          case 39:
            // →
            evt.preventDefault();
            ++nextCol;
            if (isMovable()) {
              this._charactor.moveRight();
            }
            break;
          case 40:
            // ↓
            evt.preventDefault();
            ++nextRow;
            if (isMovable()) {
              this._charactor.moveDown();
            }
            break;
        }
      }
    }, {
      key: 'switchZurag',
      value: function switchZurag(zurag) {
        this._zurag = zurag;
        this._zuragCanvas = document.createElement('canvas');
        this._zuragCanvasContext = this._zuragCanvas.getContext('2d');
        this._zuragCanvas.height = zurag.rowNum * 48;
        this._zuragCanvas.width = zurag.colNum * 48;
      }
    }, {
      key: '_serialize',
      value: function _serialize() {
        return {
          zuragNer: this._zurag.ner
        };
      }
    }, {
      key: '_deserialize',
      value: function _deserialize(serialized) {
        this._zurag = FieldScene.zurags[serialized.zuragNer];
      }
    }]);

    return FieldScene;
  })(_SceneJs.Scene);

  exports.FieldScene = FieldScene;

  FieldScene.zurags = {};
  FieldScene.mats = {};
  FieldScene.interactables = {};
  FieldScene.overlays = {};

  FieldScene.registerZurag = function (zurag) {
    return FieldScene.zurags[zurag.ner] = zurag;
  };

  FieldScene.registerMatItem = function (itemClass) {
    var ner = itemClass.name.slice(0, -'MatItem'.length);
    itemClass.ner = ner;
    FieldScene.mats[ner] = itemClass;
  };

  FieldScene.registerInteractiveItem = function (itemClass) {
    var ner = itemClass.name.slice(0, -'InteractiveItem'.length);
    itemClass.ner = ner;
    FieldScene.mats[ner] = itemClass;
  };

  FieldScene.registerOverlayItem = function (itemClass) {
    var ner = itemClass.name.slice(0, -'OverlayItem'.length);
    itemClass.ner = ner;
    FieldScene.mats[ner] = itemClass;
  };

  var Charactor = (function () {
    function Charactor() {
      _classCallCheck(this, Charactor);

      this.col = 0;
      this.row = 0;
      this.x = 0;
      this.y = 0;
      this.imageFrontMiddle = new _ResourceLoaderJs.ResourceLoader().resources['CharactorFrontMiddle.png'].resource;
      this._isMoving = false;
    }

    _createClass(Charactor, [{
      key: 'draw',
      value: function draw(context) {
        context.drawImage(this.imageFrontMiddle, this.x, this.y);
      }
    }, {
      key: 'moveUp',
      value: function moveUp() {
        if (this._isMoving) {
          return;
        }
        this.moveTo(this.col, this.row - 1);
      }
    }, {
      key: 'moveRight',
      value: function moveRight() {
        if (this._isMoving) {
          return;
        }
        this.moveTo(this.col + 1, this.row);
      }
    }, {
      key: 'moveDown',
      value: function moveDown() {
        if (this._isMoving) {
          return;
        }
        this.moveTo(this.col, this.row + 1);
      }
    }, {
      key: 'moveLeft',
      value: function moveLeft() {
        if (this._isMoving) {
          return;
        }
        this.moveTo(this.col - 1, this.row);
      }
    }, {
      key: 'moveTo',
      value: function moveTo(col, row) {
        var _this2 = this;

        var DURATION = 200;
        if (Math.abs(this.col - col) <= 1 && Math.abs(this.row - row) <= 1) {
          (function () {
            var startX = _this2.x;
            var startY = _this2.y;
            var endX = col * 48;
            var endY = row * 48;
            var startAt = Date.now();
            var loop = function loop() {
              var now = Date.now();
              _this2.x = Math.sin((now - startAt) * (Math.PI / 2) / DURATION) * (endX - startX) + startX;
              _this2.y = Math.sin((now - startAt) * (Math.PI / 2) / DURATION) * (endY - startY) + startY;
              if (now >= startAt + DURATION) {
                _this2.x = endX;
                _this2.y = endY;
                _this2._isMoving = false;
              } else {
                window.requestAnimationFrame(loop);
              }
            };
            _this2._isMoving = true;
            _this2.col = col;
            _this2.row = row;
            loop();
          })();
        } else {
          this.col = col;
          this.row = row;
          this.x = col * 48;
          this.y = row * 48;
        }
      }
    }]);

    return Charactor;
  })();

  var Zurag = (function () {
    function Zurag(mats, interactives, overlays, setting) {
      _classCallCheck(this, Zurag);

      this.colNum = mats[0].length;
      this.rowNum = mats.length;
      this.mats = mats;
      this.interactives = interactives;
      this.overlays = overlays;
      this.ner = setting.ner;
      this._isStarted = false;
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = mats[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var row = _step.value;

          if (row.length !== this.colNum) {
            throw new Error('Zurag[' + this.ner + '].mats colNums [' + mats.map(function (row) {
              return row.length;
            }).join(',') + ']');
          }
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator['return']) {
            _iterator['return']();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }

    /**
     * 48px x 48px
     */

    _createClass(Zurag, [{
      key: 'drawMats',
      value: function drawMats(context) {
        if (!this._isStarted) {
          this._isStarted = true;
          this._start();
        }
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = this.mats[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var row = _step2.value;
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
              for (var _iterator3 = row[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                var mat = _step3.value;

                mat.draw(context);
              }
            } catch (err) {
              _didIteratorError3 = true;
              _iteratorError3 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion3 && _iterator3['return']) {
                  _iterator3['return']();
                }
              } finally {
                if (_didIteratorError3) {
                  throw _iteratorError3;
                }
              }
            }
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2['return']) {
              _iterator2['return']();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }
      }
    }, {
      key: 'drawInteractives',
      value: function drawInteractives(context) {}
    }, {
      key: 'drawOverlays',
      value: function drawOverlays(context) {}
    }, {
      key: '_start',
      value: function _start() {
        this.mats = this.mats.map(function (row, y) {
          return row.map(function (ner, x) {
            return new (FieldScene.mats[ner] || MatItem)(x, y);
          });
        });
      }
    }]);

    return Zurag;
  })();

  var MatItem = (function () {
    function MatItem(x, y) {
      _classCallCheck(this, MatItem);

      this.x = x * 48;
      this.y = y * 48;
      this.isPassable = true;
    }

    _createClass(MatItem, [{
      key: 'draw',
      value: function draw(context) {}
    }]);

    return MatItem;
  })();

  var InteractiveItem = function InteractiveItem(x, y) {
    _classCallCheck(this, InteractiveItem);

    this.x = x;
    this.y = y;
  };

  var OverlayItem = function OverlayItem(x, y) {
    _classCallCheck(this, OverlayItem);

    this.x = x;
    this.y = y;
  };

  var DarkMatItem = (function (_MatItem) {
    _inherits(DarkMatItem, _MatItem);

    function DarkMatItem(x, y) {
      _classCallCheck(this, DarkMatItem);

      _get(Object.getPrototypeOf(DarkMatItem.prototype), 'constructor', this).call(this, x, y);
      this.image = new _ResourceLoaderJs.ResourceLoader().resources['Dark.png'].resource;
    }

    _createClass(DarkMatItem, [{
      key: 'draw',
      value: function draw(context) {
        context.drawImage(this.image, this.x, this.y);
      }
    }]);

    return DarkMatItem;
  })(MatItem);

  FieldScene.registerMatItem(DarkMatItem);

  FieldScene.registerZurag(new Zurag([
  // 20x20
  ['Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark'], ['Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark'], ['Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark'], ['Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark'], ['Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark'], ['Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark'], ['Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark'], ['Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark'], ['Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark'], ['Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark'], ['Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark'], ['Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark'], ['Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark'], ['Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark'], ['Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark'], ['Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark'], ['Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark'], ['Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark'], ['Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark'], ['Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark', 'Dark']], [], [[[0, 0], 'Tree']], {
    ner: 'Start',
    bgm: 'qwertyuiop.ogg'
  }));
});
(function (global, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['exports', './FieldScene.js', './ResourceLoader.js', './Scene.js'], factory);
  } else if (typeof exports !== 'undefined') {
    factory(exports, require('./FieldScene.js'), require('./ResourceLoader.js'), require('./Scene.js'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.FieldScene, global.ResourceLoader, global.Scene);
    global.World = mod.exports;
  }
})(this, function (exports, _FieldSceneJs, _ResourceLoaderJs, _SceneJs) {
  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var World = (function () {
    function World() {
      var _this = this;

      _classCallCheck(this, World);

      var me = this;

      function adjustCanvas() {
        me.canvas.height = window.innerHeight;
        me.canvas.width = window.innerWidth;
      }

      this.canvas = document.getElementById('world');
      this.scene = new LoadingScene(this);
      this.serialized = {};
      window.addEventListener('resize', adjustCanvas);
      adjustCanvas();
      window.addEventListener('unload', function () {
        _this.scene.destructor();
        _this.saveData();
      });
      window.addEventListener('click', function (evt) {
        return _this.scene.onClick(evt);
      });
      window.addEventListener('keydown', function (evt) {
        return _this.scene.onKeyDown(evt);
      });
      window.addEventListener('keypress', function (evt) {
        return _this.scene.onKeyPress(evt);
      });
      window.addEventListener('keyup', function (evt) {
        return _this.scene.onKeyUp(evt);
      });
    }

    _createClass(World, [{
      key: 'loadData',
      value: function loadData() {
        var _this2 = this;

        return new Promise(function (resolve, reject) {
          _this2.serialized = {};
          resolve();
        });
      }
    }, {
      key: 'saveData',
      value: function saveData() {
        console.log(this.serialized);
        return new Promise(function (resolve, reject) {
          resolve();
        });
      }
    }, {
      key: 'nextScene',
      value: function nextScene(sceneClass) {
        this.scene.destructor();
        this.scene = new sceneClass(this);
      }
    }]);

    return World;
  })();

  exports.World = World;

  var LoadingScene = (function (_Scene) {
    _inherits(LoadingScene, _Scene);

    function LoadingScene(world) {
      _classCallCheck(this, LoadingScene);

      _get(Object.getPrototypeOf(LoadingScene.prototype), 'constructor', this).call(this, world);
      this._init();
    }

    _createClass(LoadingScene, [{
      key: 'destructor',
      value: function destructor() {
        _get(Object.getPrototypeOf(LoadingScene.prototype), 'destructor', this).call(this);
        var node = document.getElementsByClassName('loadingScene')[0];
        node.parentNode.removeChild(node);
      }
    }, {
      key: '_init',
      value: function _init() {
        var node;
        return regeneratorRuntime.async(function _init$(context$2$0) {
          while (1) switch (context$2$0.prev = context$2$0.next) {
            case 0:
              node = document.importNode(document.getElementById('loadingScene').content, true).firstElementChild;

              document.body.appendChild(node);
              context$2$0.next = 4;
              return regeneratorRuntime.awrap(new _ResourceLoaderJs.ResourceLoader().loadSet('init'));

            case 4:
              context$2$0.next = 6;
              return regeneratorRuntime.awrap(this.world.loadData());

            case 6:
              this.world.nextScene(_FieldSceneJs.FieldScene);

            case 7:
            case 'end':
              return context$2$0.stop();
          }
        }, null, this);
      }
    }]);

    return LoadingScene;
  })(_SceneJs.Scene);
});
(function (global, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['exports', './World.js'], factory);
  } else if (typeof exports !== 'undefined') {
    factory(exports, require('./World.js'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.World);
    global.main = mod.exports;
  }
})(this, function (exports, _WorldJs) {
  /* jshint browser:true, strict:false */
  'use strict';

  // ner   name 名前
  // zurag map  地図

  window.addEventListener('DOMContentLoaded', function () {
    return new _WorldJs.World();
  });
});