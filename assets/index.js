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
    global._wavable = mod.exports;
  }
})(this, function (exports, _baselibJs) {
  /* jshint browser:true, strict:false */

  'use strict';

  Object.defineProperty(exports, '__esModule', {
    value: true
  });

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var Wavable = (function () {
    /**
     * @param {HTMLElement} target
     */

    function Wavable(target) {
      var direction = arguments.length <= 1 || arguments[1] === undefined ? ['horizontal', 'vertical'].sample() : arguments[1];

      _classCallCheck(this, Wavable);

      this.direction = direction;
      this.wavableBackgrounds = [];
      this._appendBackgrounds(target);
      (0, _baselibJs.setStyle)(target, {
        background: 'transparent',
        position: 'relative'
      });
    }

    _createClass(Wavable, [{
      key: 'wave',
      value: function wave() {
        var _this = this;

        window.requestAnimationFrame(function () {
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = _this.wavableBackgrounds[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var background = _step.value;

              background.classList.add('wavable_' + _this.direction + 'Background-waving');
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
        });
        window.setTimeout(function () {
          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = undefined;

          try {
            for (var _iterator2 = _this.wavableBackgrounds[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              var background = _step2.value;

              background.classList.remove('wavable_' + _this.direction + 'Background-waving');
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
        }, 900);
      }
    }, {
      key: '_appendBackgrounds',
      value: function _appendBackgrounds(target) {
        var style = window.getComputedStyle(target),
            height = parseInt(style.marginTop) + parseInt(style.paddingTop) + parseInt(style.height) + parseInt(style.paddingBottom) + parseInt(style.marginBottom),
            width = parseInt(style.marginLeft) + parseInt(style.paddingLeft) + parseInt(style.width) + parseInt(style.paddingRight) + parseInt(style.marginRight);
        var fragment = document.createDocumentFragment();
        for (var i = 0, iz = this.direction === 'horizontal' ? height : width; i < iz; ++i) {
          var div = this._createBackground(this.direction === 'horizontal' ? width : height, style.backgroundColor, i);
          fragment.appendChild(div);
          this.wavableBackgrounds.push(div);
        }
        target.appendChild(fragment);
      }
    }, {
      key: '_createBackground',
      value: function _createBackground(length, backgroundColor, i) {
        var div = document.createElement('div');
        div.classList.add('wavable_' + this.direction + 'Background');
        (0, _baselibJs.setStyle)(div, {
          '-animationDelay': i / 300 + 's',
          backgroundColor: backgroundColor
        });
        if (this.direction === 'horizontal') {
          (0, _baselibJs.setStyle)(div, {
            left: 0,
            top: i + 'px',
            width: length + 'px'
          });
        } else {
          (0, _baselibJs.setStyle)(div, {
            height: length + 'px',
            left: i + 'px',
            top: 0
          });
        }
        return div;
      }
    }]);

    return Wavable;
  })();

  exports.Wavable = Wavable;
});
(function (global, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['exports', './_baselib.js', './_wavable.js'], factory);
  } else if (typeof exports !== 'undefined') {
    factory(exports, require('./_baselib.js'), require('./_wavable.js'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global._baselib, global._wavable);
    global.index = mod.exports;
  }
})(this, function (exports, _baselibJs, _wavableJs) {
  /* jshint browser:true, strict:false */

  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var UiIndex = (function () {
    function UiIndex() {
      var _this = this;

      _classCallCheck(this, UiIndex);

      this.wavables = [];
      this._setAsWavable(document.querySelectorAll('.index_item'));
      this._setAsWavable(document.querySelectorAll('.profileIndex_item'));
      window.setTimeout(function () {
        return _this.waveRandom();
      }, 10);
    }

    _createClass(UiIndex, [{
      key: '_setAsWavable',
      value: function _setAsWavable(items) {
        var _this2 = this;

        Array.from(items).forEach(function (item) {
          var wavable = new _wavableJs.Wavable(item);
          _this2.wavables.push(wavable);
          item.addEventListener('mouseover', function (evt) {
            evt.stopPropagation();
            wavable.wave();
          });
          item.addEventListener('click', function () {
            return wavable.wave();
          });
        });
      }
    }, {
      key: 'waveRandom',
      value: function waveRandom() {
        var _this3 = this;

        this.wavables.sample().wave();
        window.setTimeout(function () {
          return _this3.waveRandom();
        }, (0, _baselibJs.Range)(1, 10).sample() * 1000);
      }
    }]);

    return UiIndex;
  })();

  window.addEventListener('DOMContentLoaded', function () {
    return new UiIndex();
  });
});