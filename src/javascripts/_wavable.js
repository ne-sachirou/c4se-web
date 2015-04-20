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
      node.style[`moz${upperCase}`]    = rules[`-${prop}`];
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
  constructor(target) {
    this.wavableBackgrounds = [];
    this._appendBackgrounds(target);
    setStyle(target, {
      background : 'transparent',
      position   : 'relative',
    });
  }

  wave() {
    for (let background of this.wavableBackgrounds) {
      background.classList.add('wavable_background-waving');
    }
    window.setTimeout(() => {
      for (let background of this.wavableBackgrounds) {
        background.classList.remove('wavable_background-waving');
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
    for (let i = 0, iz = height; i < iz; ++i) {
      var div = this._createBackground(width, style.backgroundColor, i);
      fragment.appendChild(div);
      this.wavableBackgrounds.push(div);
    }
    target.appendChild(fragment);
  }

  _createBackground(width, backgroundColor, i) {
    var div = document.createElement('div');
    div.classList.add('wavable_background');
    setStyle(div, {
      '-animationDelay' : `${i / 300}s`,
      backgroundColor   : backgroundColor,
      left              : 0,
      top               : `${i}px`,
      width             : `${width}px`,
    });
    return div;
  }
}
