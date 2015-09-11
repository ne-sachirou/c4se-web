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
    global.layout = mod.exports;
  }
})(this, function (exports, _baselibJs) {
  /* jshint browser:true, strict:false */
  /* global Taketori */

  'use strict';

  var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

  function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

  var UiLayout = function UiLayout() {
    var _this = this;

    _classCallCheck(this, UiLayout);

    this.node = document.querySelector('.page');
    this.topMenu = new UiTopMenu(this.node);
    this.sideMenu = new UiSideMenu(this.node);
    this.breadcrumb = new UiBreadcrumb(this.node);
    document.body.addEventListener('click', function () {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = _this.topMenu.rightItems[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var rightItem = _step.value;

          rightItem.close();
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
    _baselibJs.EventRouter.on('toggleLayoutSideMenu', function () {
      if (_this.sideMenu.isOpen) {
        _this.node.style.left = '0';
        _this.topMenu.whenCloseSideMenu();
        _this.sideMenu.close();
      } else {
        _this.node.style.left = '60mm';
        _this.topMenu.whenOpenSideMenu();
        _this.sideMenu.open();
      }
    });
  };

  var UiTopMenu = (function () {
    function UiTopMenu(page) {
      var _this2 = this;

      _classCallCheck(this, UiTopMenu);

      this.node = page.querySelector('.page_topMenu');
      this.leftSideToggleBtn = page.querySelector('.page_topMenu_left_sideToggleBtn');
      this.rightItems = [];
      this.leftSideToggleBtn.addEventListener('click', function () {
        return _baselibJs.EventRouter.emit('toggleLayoutSideMenu');
      });
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = Array.from(this.node.querySelectorAll('.page_topMenu_right > ul > li'))[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var rightItem = _step2.value;

          this.rightItems.push(new UiTopMenuRightItem(rightItem));
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

      _baselibJs.EventRouter.on('openLayoutTopMenuRightItem', function (openingRightItem) {
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = _this2.rightItems[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var rightItem = _step3.value;

            if (rightItem === openingRightItem) {
              continue;
            }
            rightItem.close();
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
      });
    }

    _createClass(UiTopMenu, [{
      key: 'whenOpenSideMenu',
      value: function whenOpenSideMenu() {
        this.leftSideToggleBtn.classList.remove('fa-chevron-right');
        this.leftSideToggleBtn.classList.add('fa-times');
      }
    }, {
      key: 'whenCloseSideMenu',
      value: function whenCloseSideMenu() {
        this.leftSideToggleBtn.classList.remove('fa-times');
        this.leftSideToggleBtn.classList.add('fa-chevron-right');
      }
    }]);

    return UiTopMenu;
  })();

  var UiTopMenuRightItem = (function () {
    function UiTopMenuRightItem(node) {
      var _this3 = this;

      _classCallCheck(this, UiTopMenuRightItem);

      this.isOpen = false;
      this.node = node;
      this.anchor = this.node.querySelector('a');
      this.ul = this.node.querySelector('ul');
      if (this.ul) {
        this.anchor.classList.add('fa');
        this.anchor.classList.add('fa-caret-down');
        this.anchor.addEventListener('click', function (evt) {
          evt.preventDefault();
          evt.stopPropagation();
          if (_this3.isOpen) {
            _this3.close();
          } else {
            _this3.open();
          }
        });
      }
    }

    _createClass(UiTopMenuRightItem, [{
      key: 'open',
      value: function open() {
        var _this4 = this;

        this.isOpen = true;
        window.requestAnimationFrame(function () {
          _this4.ul.style.display = 'block';
          _this4.anchor.classList.remove('fa-caret-down');
          _this4.anchor.classList.add('fa-caret-up');
          window.requestAnimationFrame(function () {
            return _this4.ul.style.opacity = 1;
          });
        });
        _baselibJs.EventRouter.emit('openLayoutTopMenuRightItem', [this]);
      }
    }, {
      key: 'close',
      value: function close() {
        var _this5 = this;

        this.isOpen = false;
        window.requestAnimationFrame(function () {
          _this5.ul.style.opacity = 0;
          _this5.anchor.classList.remove('fa-caret-up');
          _this5.anchor.classList.add('fa-caret-down');
          window.setTimeout(function () {
            return _this5.ul.style.display = 'none';
          }, 400);
        });
      }
    }]);

    return UiTopMenuRightItem;
  })();

  var UiSideMenu = (function () {
    function UiSideMenu(page) {
      _classCallCheck(this, UiSideMenu);

      this.isOpen = false;
      this.node = page.querySelector('.page_sideMenu');
    }

    _createClass(UiSideMenu, [{
      key: 'open',
      value: function open() {
        this.isOpen = true;
        this.node.style.left = '0';
      }
    }, {
      key: 'close',
      value: function close() {
        this.isOpen = false;
        this.node.style.left = '-60mm';
      }
    }]);

    return UiSideMenu;
  })();

  var UiBreadcrumb = function UiBreadcrumb(page) {
    _classCallCheck(this, UiBreadcrumb);

    this.node = page.querySelector('.breadcrumb');
    if (!this.node || this.node.querySelector('*[itemscope]')) {
      return;
    }
    var items = this.node.textContent.split('\n').filter(function (line) {
      return '' !== line.trim();
    }).map(function (line) {
      return {
        url: line.match(/^\s*(\S+)/)[1],
        title: line.match(/^\s*\S+\s+(.+)$/)[1]
      };
    });
    var scope = items.reduceRight(function (child, item) {
      var scope = (0, _baselibJs.h)('div', { itemscope: '', itemtype: 'http://data-vocabulary.org/Breadcrumb' }, [(0, _baselibJs.h)('a', { href: item.url, itemprop: 'url' }, [(0, _baselibJs.h)('span', { itemprop: 'title' }, [item.title])])]);
      if (child) {
        child.setAttribute('itemprop', 'child');
        scope.appendChild(child);
      }
      return scope;
    }, null);
    this.node.innerHTML = '';
    this.node.appendChild(scope);
  };

  window.addEventListener('DOMContentLoaded', function () {
    new UiLayout();
    var taketori = new Taketori();
    taketori.set({}).element('div.vertical').toVertical();
    window.requestAnimationFrame(function () {
      document.body.style.fontFamily = 'UniSeiJi, ' + window.getComputedStyle(document.body).fontFamily;
    });
  });
});