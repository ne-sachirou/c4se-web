/* jshint browser:true, strict:false */

import {Wavable} from './_wavable.js';

class UiIndex {
  constructor() {
    this.wavables = [];
    this._setAsWavable(document.querySelectorAll('.index_item'));
    this._setAsWavable(document.querySelectorAll('.profileIndex_item'));
    this.waveRandom();
  }

  _setAsWavable(items) {
    items = Array.from(items);
    items.forEach((item) => {
      var wavable = new Wavable(item);
      this.wavables.push(wavable);
      item.addEventListener('mouseover', (evt) => {
        evt.stopPropagation();
        wavable.wave();
      });
      item.addEventListener('click', () => wavable.wave());
    });
  }

  waveRandom() {
    this.wavables[Math.floor(Math.random() * this.wavables.length)].wave();
    window.setTimeout(() => this.waveRandom(), Math.floor(Math.random() * 10) * 1000);
  }
}

window.addEventListener('DOMContentLoaded', () => new UiIndex());
