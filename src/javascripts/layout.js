/* jshint browser:true, strict:false */
/* global Taketori */

import {EventRouter} from './_baselib.js';

class UiLayout {
  constructor() {
    this.content  = document.querySelector('.page_content');
    this.footer   = document.querySelector('.page_footer');
    this.topMenu  = new UiTopMenu();
    this.sideMenu = new UiSideMenu();
    document.body.addEventListener('click', () => {
      for (let rightItem of this.topMenu.rightItems) {
        rightItem.close();
      }
    });
    EventRouter.on('toggleLayoutSideMenu', () => {
      if (this.sideMenu.isOpen) {
        this.content.style.left = '0';
        this.footer.style.left  = '0';
        this.topMenu.whenCloseSideMenu();
        this.sideMenu.close();
      } else {
        this.content.style.left = '60mm';
        this.footer.style.left  = '60mm';
        this.topMenu.whenOpenSideMenu();
        this.sideMenu.open();
      }
    });
  }
}

class UiTopMenu {
  constructor() {
    this.node              = document.querySelector('.page_topMenu');
    this.leftSideToggleBtn = document.querySelector('.page_topMenu_left_sideToggleBtn');
    this.rightItems        = [];
    this.leftSideToggleBtn.addEventListener('click', () => EventRouter.emit('toggleLayoutSideMenu'));
    for (let rightItem of Array.from(this.node.querySelectorAll('.page_topMenu_right > ul > li'))) {
      this.rightItems.push(new UiTopMenuRightItem(rightItem));
    }
    EventRouter.on('openLayoutTopMenuRightItem', (openingRightItem) => {
      for (let rightItem of this.rightItems) {
        if (rightItem === openingRightItem) {
          continue;
        }
        rightItem.close();
      }
    });
  }

  whenOpenSideMenu() {
    this.node.style.left = '60mm';
    this.leftSideToggleBtn.classList.remove('fa-chevron-right');
    this.leftSideToggleBtn.classList.add('fa-times');
  }

  whenCloseSideMenu() {
    this.node.style.left = '0';
    this.leftSideToggleBtn.classList.remove('fa-times');
    this.leftSideToggleBtn.classList.add('fa-chevron-right');
  }
}

class UiTopMenuRightItem {
  constructor(node) {
    this.isOpen = false;
    this.node   = node;
    this.anchor = this.node.querySelector('a');
    this.ul     = this.node.querySelector('ul');
    if (this.ul) {
      this.anchor.classList.add('fa');
      this.anchor.classList.add('fa-caret-down');
      this.anchor.addEventListener('click', (evt) => {
        evt.preventDefault();
        evt.stopPropagation();
        if (this.isOpen) {
          this.close();
        } else {
          this.open();
        }
      });
    }
  }

  open() {
    this.isOpen           = true;
    this.ul.style.display = 'block';
    this.anchor.classList.remove('fa-caret-down');
    this.anchor.classList.add('fa-caret-up');
    EventRouter.emit('openLayoutTopMenuRightItem', [this]);
    window.requestAnimationFrame(() => this.ul.style.opacity = 1);
  }

  close() {
    this.isOpen           = false;
    this.ul.style.opacity = 0;
    this.anchor.classList.remove('fa-caret-up');
    this.anchor.classList.add('fa-caret-down');
    window.setTimeout(() => this.ul.style.display = 'none', 400);
  }
}

class UiSideMenu {
  constructor() {
    this.isOpen = false;
    this.node   = document.querySelector('.page_sideMenu');
  }

  open() {
    this.isOpen          = true;
    this.node.style.left = '0';
  }

  close() {
    this.isOpen          = false;
    this.node.style.left = '-60mm';
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new UiLayout();
  var taketori = new Taketori();
  taketori.set({}).element('div.vertical-content').toVertical();
});
