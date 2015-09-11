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
    global._baselib = mod.exports;
  }
})(this, function (exports) {
  /* jshint browser:true, strict:false */

  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports.rand = rand;
  exports.Range = Range;
  exports.setStyle = setStyle;
  exports.h = h;

  function rand(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  Array.prototype.sample = function () {
    return this[rand(0, this.length)];
  };

  function Range(min, max) {
    if (!(this instanceof Range)) {
      return new Range(min, max);
    }
    this.min = min;
    this.max = max;
  }

  Range.prototype[Symbol.iterator] = function () {
    var _this = this;

    var current = this.min - 1;
    return {
      next: function next() {
        ++current;
        return {
          value: current,
          done: current > _this.max
        };
      }
    };
  };

  Range.prototype.sample = function () {
    return rand(this.min, this.max);
  };

  var EventRouter = {
    listeners: {},

    emit: function emit(name, params, me) {
      params = params || [];
      me = me || null;
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.listeners[name][Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var listener = _step.value;

          listener.apply(me, params);
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
    },

    on: function on(name, listener) {
      if (!this.listeners[name]) {
        this.listeners[name] = [];
      }
      this.listeners[name].push(listener);
    }
  };

  exports.EventRouter = EventRouter;
  /**
   * @param {HTMLElement} node
   * @param {Hash}        rules
   *
   * @return void
   */

  function setStyle(node, rules) {
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = Object.keys(rules)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var prop = _step2.value;

        if ('-' === prop[0]) {
          prop = prop.slice(1);
          var upperCase = prop[0].toUpperCase() + prop.slice(1);
          node.style['Moz' + upperCase] = rules['-' + prop];
          node.style['ms' + upperCase] = rules['-' + prop];
          node.style['webkit' + upperCase] = rules['-' + prop];
        }
        node.style[prop] = rules[prop];
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

  /**
   * Create a real node.
   *
   * Example
   *   h('div#momonga.momonga', [h('i', ['mOmonga'])]); <div id="momonga" class="momonga"><i>mOmonga</i></div>
   *   h('a', {href : 'momonga.html'}, ['mOmonga']);    <a href="momonga.html">mOmonga</a>
   *   h('a', {name : 'momonga'});                      <a name="momonga"></a>
   *   h('b', ['mOmonga']);                             <b>mOmonga</a>
   *   h('hr');                                         <hr/>
   *
   * @param {string}          elmName
   * @param {hash}            attrs
   * @param {(Node|string)[]} childs
   *
   * @return HTMLElement
   */

  function h(elmName, attrs, childs) {
    if (void 0 === childs) {
      if (Array.isArray(attrs)) {
        childs = attrs;
        attrs = {};
      } else {
        childs = [];
        attrs = attrs || {};
      }
    }
    elmName = elmName.replace(/#[-_\w]+/g, function (match) {
      attrs.id = match.slice(1);
      return '';
    }).replace(/\.[-_\w]+/g, function (match) {
      attrs['class'] = (attrs['class'] || '') + ' ' + match.slice(1);
      return '';
    });
    return h_(elmName, attrs, childs);
  }

  function h_(elmName, attrs, childs) {
    var elm = document.createElement(elmName);
    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
      for (var _iterator3 = Object.keys(attrs)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
        var attrName = _step3.value;

        elm.setAttribute(attrName, attrs[attrName]);
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

    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
      for (var _iterator4 = childs[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
        var child = _step4.value;

        if (typeof child === 'string' || child instanceof String) {
          child = document.createTextNode(child);
        }
        elm.appendChild(child);
      }
    } catch (err) {
      _didIteratorError4 = true;
      _iteratorError4 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion4 && _iterator4['return']) {
          _iterator4['return']();
        }
      } finally {
        if (_didIteratorError4) {
          throw _iteratorError4;
        }
      }
    }

    return elm;
  }
});
(function (global, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['exports', './_baselib.js'], factory);
  } else if (typeof exports !== 'undefined') {
    factory(exports, require('./_baselib.js'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global._baselib);
    global.feed = mod.exports;
  }
})(this, function (exports, _baselibJs) {
  /* jshint browser:true, strict:false */

  'use strict';

  function showFeed(target) {
    var count = parseInt(target.dataset.feedCount),
        req = new XMLHttpRequest();
    req.open('GET', '/api/feed?url=' + encodeURIComponent(target.dataset.feedUrl) + '&count=' + count);
    req.send();
    req.onload = function () {
      var i = 1,
          feed = JSON.parse(req.responseText),
          fragment = document.createDocumentFragment();
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = feed.entries[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var entry = _step.value;

          var entryNode = (0, _baselibJs.h)('section', { 'class': 'feed_entry' }, [(0, _baselibJs.h)('h1', [(0, _baselibJs.h)('a', { href: entry.link }, [entry.title])]), (0, _baselibJs.h)('p', [entry.summary]), (0, _baselibJs.h)('div.feed_entry_updated', [entry.updated || entry.published])]);
          fragment.appendChild(entryNode);
          ++i;
          if (i > count) {
            break;
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

      target.appendChild(fragment);
    };
    req.onerror = function () {
      return console.error(req);
    };
  }

  window.addEventListener('DOMContentLoaded', function () {
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = Array.from(document.querySelectorAll('.feed'))[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var node = _step2.value;

        showFeed(node);
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
  });
});