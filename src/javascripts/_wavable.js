/* jshint browser:true, strict:false */

/**
 * @param {HTMLElement} node
 * @param {Hash}        rules
 *
 * @return void
 */
function setStyle(node, rules) {
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

export class Wavable {
  /**
   * @param {HTMLElement} target
   */
  constructor(target, direction = ['horizontal', 'vertical'][Math.floor(Math.random() * 2)]) {
    this.direction          = direction;
    this.wavableBackgrounds = [];
    this._appendBackgrounds(target);
    setStyle(target, {
      background : 'transparent',
      position   : 'relative',
    });
  }

  wave() {
    for (let background of this.wavableBackgrounds) {
      background.classList.add(`wavable_${this.direction}Background-waving`);
    }
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
      '-animationDelay' : `${i / length / 6}s`,
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
