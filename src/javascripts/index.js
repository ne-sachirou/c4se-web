/* jshint browser:true, strict:false */

import {Wavable} from './_wavable.js';

class UiIndex {
  constructor() {
    this.indexItems = Array.from(document.querySelectorAll('.index_item'));
    this.indexItems.forEach((indexItem) => {
      var wavable = new Wavable(indexItem);
      indexItem.addEventListener('mouseover', (evt) => {
        evt.stopPropagation();
        wavable.wave();
      });
      indexItem.addEventListener('click', () => wavable.wave());
    });
  }
}

window.addEventListener('DOMContentLoaded', () => new UiIndex());
