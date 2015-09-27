import {EventRouter} from '../../_baselib.js';

export class UiInfo {
  constructor() {
    this._node   = document.querySelector('.info');
    this._nodeBg = document.querySelector('.infoBg');
    new UiInfoToggleBtn(this);
  }

  openInfo() {
    this._node.classList.remove('info-closed');
    this._node.classList.add('info-open');
    this._nodeBg.classList.remove('infoBg-closed');
    this._nodeBg.classList.add('infoBg-open');
  }

  closeInfo() {
    this._node.classList.remove('info-open');
    this._node.classList.add('info-closed');
    this._nodeBg.classList.remove('infoBg-open');
    this._nodeBg.classList.add('infoBg-closed');
  }
}

class UiInfoToggleBtn {
  constructor(parentUi) {
    this._node        = document.querySelector('.infoToggleBtn');
    this._nodeInner   = this._node.querySelector('.infoToggleBtn_inner');
    this._uiInfo      = parentUi;
    this._isInfoOpen  = false;
    this._node.addEventListener('click', () => {
      if (this._isInfoOpen) {
        this._close();
      } else {
        this._open();
      }
    });
  }

  _open() {
    this._isInfoOpen = true;
    this._node.classList.remove('infoToggleBtn-closed');
    this._node.classList.add('infoToggleBtn-open');
    this._nodeInner.classList.remove('fa-chevron-left');
    this._nodeInner.classList.add('fa-times');
    this._uiInfo.openInfo();
  }

  _close() {
    this._isInfoOpen = false;
    this._node.classList.remove('infoToggleBtn-open');
    this._node.classList.add('infoToggleBtn-closed');
    this._nodeInner.classList.remove('fa-times');
    this._nodeInner.classList.add('fa-chevron-left');
    this._uiInfo.closeInfo();
  }
}
