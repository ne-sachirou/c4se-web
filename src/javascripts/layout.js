/* global Taketori */
import {EventRouter, h} from './_baselib.js';

class UiLayout {
  constructor() {
    this.node       = document.querySelector('.page');
    this.topMenu    = new UiTopMenu(this.node);
    this.sideMenu   = new UiSideMenu(this.node);
    this.breadcrumb = new UiBreadcrumb(this.node);
    document.body.addEventListener('click', () => {
      for (let rightItem of this.topMenu.rightItems) {
        rightItem.close();
      }
    });
    EventRouter.on('toggleLayoutSideMenu', () => {
      if (this.sideMenu.isOpen) {
        this.node.style.left = '0';
        this.topMenu.whenCloseSideMenu();
        this.sideMenu.close();
      } else {
        this.node.style.left = '60mm';
        this.topMenu.whenOpenSideMenu();
        this.sideMenu.open();
      }
    });
  }
}

class UiTopMenu {
  constructor(page) {
    this.node              = page.querySelector('.page_topMenu');
    this.leftSideToggleBtn = page.querySelector('.page_topMenu_left_sideToggleBtn');
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
    this.leftSideToggleBtn.classList.remove('fa-chevron-right');
    this.leftSideToggleBtn.classList.add('fa-times');
  }

  whenCloseSideMenu() {
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
  constructor(page) {
    this.isOpen = false;
    this.node   = page.querySelector('.page_sideMenu');
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
  constructor(page) {
    this.node = page.querySelector('.breadcrumb');
    if (!this.node || this.node.querySelector('*[itemscope]')) {
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
  window.requestAnimationFrame(() => {
    document.body.style.fontFamily = 'UniSeiJi, ' + window.getComputedStyle(document.body).fontFamily;
  });
});
