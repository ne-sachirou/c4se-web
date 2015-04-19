'use strict';

var EventRouter = {
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

class UiWavable {
  constructor(target) {
    this.target             = target;
    this.wavableBackgrounds = [];
    {
      const style = window.getComputedStyle(target);
      var fragment = document.createDocumentFragment();
      for (let i = 0, iz = parseInt(style.height); i < iz; ++i) {
        var div = document.createElement('div');
        div.classList.add('wavable_background');
        div.style.mozAnimationDelay    = (i / 300) + 's';
        div.style.msAnimationDelay     = (i / 300) + 's';
        div.style.webkitAnimationDelay = (i / 300) + 's';
        div.style.animationDelay       = (i / 300) + 's';
        div.style.backgroundColor      = style.backgroundColor;
        div.style.top                  = i + 'px';
        div.style.width                = (parseInt(style.marginLeft) + parseInt(style.paddingLeft) + parseInt(style.width) + parseInt(style.paddingRight) + parseInt(style.marginRight)) + 'px';
        fragment.appendChild(div);
        this.wavableBackgrounds.push(div);
      }
      target.appendChild(fragment);
    }
    target.style.background = 'transparent';
    target.style.position   = 'relative';
  }

  wave() {
    for (let background of this.wavableBackgrounds) {
      background.classList.add('wavable_background-waving');
    }
    window.setTimeout(() => {
      for (let background of this.wavableBackgrounds) {
        background.classList.remove('wavable_background-waving');
      }
    }, 600);
  }
}

class UiIndex {
  constructor() {
    this.nodeIndexItems = Array.from(document.querySelectorAll('.index_item'));
    this.nodeIndexItems.forEach((nodeIndexItem) => {
      var wavable = new UiWavable(nodeIndexItem);
      nodeIndexItem.addEventListener('mouseover', () => wavable.wave());
      nodeIndexItem.addEventListener('click'    , () => wavable.wave());
    });
  }
}

window.addEventListener('DOMContentLoaded', () => new UiIndex());
