export function rand(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

Array.prototype.sample = function () {
  return this[rand(0, this.length)];
};

export function Range(min, max) {
  if (!(this instanceof Range)) {
    return new Range(min, max);
  }
  this.min = min;
  this.max = max;
}

Range.prototype[Symbol.iterator] = function () {
  var current = this.min - 1;
  return {
    next : () => {
      ++current;
      return {
        value : current,
        done  : current > this.max,
      };
    }
  };
};

Range.prototype.sample = function () {
  return rand(this.min, this.max);
};

export var EventRouter = {
  listeners : {},

  emit : function (name, params, me) {
    params = params || [];
    me     = me     || null;
    for (let listener of this.listeners[name]) {
      listener.apply(me, params);
    }
  },

  on : function (name, listener) {
    if (!this.listeners[name]) {
      this.listeners[name] = [];
    }
    this.listeners[name].push(listener);
  }
};

/**
 * @param {HTMLElement} node
 * @param {Hash}        rules
 *
 * @return void
 */
export function setStyle(node, rules) {
  for (let prop of Object.keys(rules)) {
    if ('-' === prop[0]) {
      prop = prop.slice(1);
      const upperCase = prop[0].toUpperCase() + prop.slice(1);
      node.style[`Moz${upperCase}`]    = rules[`-${prop}`];
      node.style[`ms${upperCase}`]     = rules[`-${prop}`];
      node.style[`webkit${upperCase}`] = rules[`-${prop}`];
    }
    node.style[prop] = rules[prop];
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
export function h(elmName, attrs, childs) {
  if (void 0 === childs) {
    if (Array.isArray(attrs)) {
      childs = attrs;
      attrs  = {};
    } else {
      childs = [];
      attrs  = attrs || {};
    }
  }
  elmName = elmName.replace(/#[-_\w]+/g, (match) => {
    attrs.id = match.slice(1);
    return '';
  }).replace(/\.[-_\w]+/g, (match) => {
    attrs['class'] = (attrs['class'] || '') + ' ' + match.slice(1);
    return '';
  });
  return h_(elmName, attrs, childs);
}

function h_(elmName, attrs, childs) {
  var elm = document.createElement(elmName);
  for (let attrName of Object.keys(attrs)) {
    elm.setAttribute(attrName, attrs[attrName]);
  }
  for (let child of childs) {
    if (typeof child === 'string' || child instanceof String) {
      child = document.createTextNode(child);
    }
    elm.appendChild(child);
  }
  return elm;
}
