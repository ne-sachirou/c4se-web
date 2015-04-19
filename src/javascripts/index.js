/* jshint browser:true */
(function () {
'use strict';

// var EventRouter = {
//   listeners : {},
//
//   emit : function (name, params, me) {
//     params = params || [];
//     me     = me     || null;
//     this.listeners[name].forEach(function (listener) {
//       listener.apply(me, params);
//     });
//   },
//
//   on : function (name, listener) {
//     if (!this.listeners[name]) {
//       this.listeners[name] = [];
//     }
//     this.listeners[name].push(listener);
//   }
// };

class UiWavable {
  constructor(target) {
    this.wavableBackgrounds = [];
    this._appendBackgrounds(target);
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

  _appendBackgrounds(target) {
    const style = window.getComputedStyle(target);
    var width = parseInt(style.marginLeft) +
      parseInt(style.paddingLeft) +
      parseInt(style.width) +
      parseInt(style.paddingRight) +
      parseInt(style.marginRight);
    var fragment = document.createDocumentFragment();
    for (let i = 0, iz = parseInt(style.height); i < iz; ++i) {
      var div = this._createBackground(width, style.backgroundColor, i);
      fragment.appendChild(div);
      this.wavableBackgrounds.push(div);
    }
    target.appendChild(fragment);
  }

  _createBackground(width, backgroundColor, i) {
    var div = document.createElement('div');
    div.classList.add('wavable_background');
    div.style.mozAnimationDelay    = (i / 300) + 's';
    div.style.msAnimationDelay     = (i / 300) + 's';
    div.style.webkitAnimationDelay = (i / 300) + 's';
    div.style.animationDelay       = (i / 300) + 's';
    div.style.backgroundColor      = backgroundColor;
    div.style.top                  = i + 'px';
    div.style.width                = width + 'px';
    return div;
  }
}

class UiIndex {
  constructor() {
    this.indexItems = Array.from(document.querySelectorAll('.index_item'));
    this.indexItems.forEach((indexItem) => {
      var wavable = new UiWavable(indexItem);
      indexItem.addEventListener('mouseover', () => wavable.wave());
      indexItem.addEventListener('click'    , () => wavable.wave());
    });
  }
}

window.addEventListener('DOMContentLoaded', () => new UiIndex());
}());
