/* jshint browser:true, strict:false */

import {setStyle} from './_baselib.js';

export class Wavable {
  /**
   * @param {HTMLElement} target
   */
  constructor(target, direction = ['horizontal', 'vertical'].sample()) {
    this.direction          = direction;
    this.wavableBackgrounds = [];
    this._appendBackgrounds(target);
    setStyle(target, {
      background : 'transparent',
      position   : 'relative',
    });
  }

  wave() {
    window.requestAnimationFrame(() => {
      for (let background of this.wavableBackgrounds) {
        background.classList.add(`wavable_${this.direction}Background-waving`);
      }
    });
    window.setTimeout(() => {
      for (let background of this.wavableBackgrounds) {
        background.classList.remove(`wavable_${this.direction}Background-waving`);
      }
    }, 900);
  }

  _appendBackgrounds(target) {
    const style = window.getComputedStyle(target),
          height = parseInt(style.marginTop) +
            parseInt(style.paddingTop) +
            parseInt(style.height) +
            parseInt(style.paddingBottom) +
            parseInt(style.marginBottom),
          width = parseInt(style.marginLeft) +
            parseInt(style.paddingLeft) +
            parseInt(style.width) +
            parseInt(style.paddingRight) +
            parseInt(style.marginRight);
    var fragment = document.createDocumentFragment();
    for (let i = 0, iz = this.direction === 'horizontal' ? height : width; i < iz; ++i) {
      var div = this._createBackground(this.direction === 'horizontal' ? width : height, style.backgroundColor, i);
      fragment.appendChild(div);
      this.wavableBackgrounds.push(div);
    }
    target.appendChild(fragment);
  }

  _createBackground(length, backgroundColor, i) {
    var div = document.createElement('div');
    div.classList.add(`wavable_${this.direction}Background`);
    setStyle(div, {
      '-animationDelay' : `${i / 300}s`,
      backgroundColor   : backgroundColor,
    });
    if (this.direction === 'horizontal') {
      setStyle(div, {
        left  : 0,
        top   : `${i}px`,
        width : `${length}px`,
      });
    } else {
      setStyle(div, {
        height : `${length}px`,
        left   : `${i}px`,
        top    : 0,
      });
    }
    return div;
  }
}
