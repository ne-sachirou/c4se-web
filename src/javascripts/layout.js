/* jshint browser:true, strict:false */
/* global Taketori */

import {EventRouter, h} from './_baselib.js';

class UiLayout {
  constructor() {
    this.content    = document.querySelector('.page_content');
    this.footer     = document.querySelector('.page_footer');
    this.topMenu    = new UiTopMenu();
    this.sideMenu   = new UiSideMenu();
    this.breadcrumb = new UiBreadcrumb();
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
    this.isOpen = true;
    window.requestAnimationFrame(() => {
      this.ul.style.display = 'block';
      this.anchor.classList.remove('fa-caret-down');
      this.anchor.classList.add('fa-caret-up');
      window.requestAnimationFrame(() => this.ul.style.opacity = 1);
    });
    EventRouter.emit('openLayoutTopMenuRightItem', [this]);
  }

  close() {
    this.isOpen = false;
    window.requestAnimationFrame(() => {
      this.ul.style.opacity = 0;
      this.anchor.classList.remove('fa-caret-up');
      this.anchor.classList.add('fa-caret-down');
      window.setTimeout(() => this.ul.style.display = 'none', 400);
    });
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

class UiBreadcrumb {
  constructor() {
    this.node = document.querySelector('.breadcrumb');
    if (!this.node) {
      return;
    }
    var items = this.node.textContent.split('\n').
      filter((line) => '' !== line.trim()).
      map((line) => {
        return {
          url   : line.match(/^\s*(\S+)/      )[1],
          title : line.match(/^\s*\S+\s+(.+)$/)[1],
        };
      });
    var scope = items.reduceRight((child, item) => {
      var scope = h('div', {itemscope : '', itemtype: 'http://data-vocabulary.org/Breadcrumb'}, [
        h('a', {href : item.url, itemprop : 'url'}, [
          h('span', {itemprop : 'title'}, [item.title])
        ])
      ]);
      if (child) {
        child.setAttribute('itemprop', 'child');
        scope.appendChild(child);
      }
      return scope;
    }, null);
    this.node.innerHTML = '';
    this.node.appendChild(scope);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new UiLayout();
  var taketori = new Taketori();
  taketori.set({}).element('div.vertical').toVertical();
});
