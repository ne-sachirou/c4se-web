/* jshint browser:true, strict:false */

import {Range} from './_baselib.js';
import {Wavable} from './_wavable.js';

class UiIndex {
  constructor() {
    this.wavables = [];
    this._setAsWavable(document.querySelectorAll('.index_item'));
    this._setAsWavable(document.querySelectorAll('.profileIndex_item'));
    window.setTimeout(() => this.waveRandom(), 10);
  }

  _setAsWavable(items) {
    Array.from(items).forEach((item) => {
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
    this.wavables.sample().wave();
    window.setTimeout(() => this.waveRandom(), Range(1, 10).sample() * 1000);
  }
}

window.addEventListener('DOMContentLoaded', () => new UiIndex());
