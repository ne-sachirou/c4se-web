/* jshint browser:true, strict:false */

import {Wavable} from './_wavable.js';

class UiIndex {
  constructor() {
    this._setAsWavable(document.querySelectorAll('.index_item'));
    this._setAsWavable(document.querySelectorAll('.profileIndex_item'));
  }

  _setAsWavable(items) {
    Array.from(items).forEach((item) => {
      var wavable = new Wavable(item);
      item.addEventListener('mouseover', (evt) => {
        evt.stopPropagation();
        wavable.wave();
      });
      item.addEventListener('click', () => wavable.wave());
    });
  }
}

window.addEventListener('DOMContentLoaded', () => new UiIndex());
