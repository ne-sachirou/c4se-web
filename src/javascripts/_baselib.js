/* jshint browser:true, strict:false */

export function rand(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

Array.prototype.sample = function () {
  return this[rand(0, this.length - 1)];
};

export function Range(min, max) {
  if (!(this instanceof Range)) {
    return new Range(min, max);
  }
  this.min = min;
  this.max = max;
  return this;
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
    this.listeners[name].forEach(function (listener) {
      listener.apply(me, params);
    });
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
