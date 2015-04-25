/* jshint browser:true, strict:false */

var EventRouter = {
  listeners : {},

  emit : function (name, params, me) {
    params = params || [];
    me     = me     || null;
    this.listeners[name].forEach(function (listener) {
      listener.apply(me, params);
    });
  },

  on : function (name, listener) {
    if (!this.listeners[name]) {
      this.listeners[name] = [];
    }
    this.listeners[name].push(listener);
  }
};

class UiLayout {
  constructor() {
    this.content  = document.querySelector('.page_content');
    this.footer   = document.querySelector('.page_footer');
    this.topMenu  = new UiTopMenu();
    this.sideMenu = new UiSideMenu();
    EventRouter.on('toggleLayoutSideMenu', () => {
      if (this.sideMenu.isOpen) {
        this.content.style.left = '0';
        this.footer.style.left  = '0';
        this.topMenu.whenCloseSideMenu();
        this.sideMenu.close();
      } else {
        this.content.style.left = '48mm';
        this.footer.style.left  = '48mm';
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
    this.node.style.left = '48mm';
    this.leftSideToggleBtn.classList.remove('fa-compass');
    this.leftSideToggleBtn.classList.add('fa-times');
  }

  whenCloseSideMenu() {
    this.node.style.left = '0';
    this.leftSideToggleBtn.classList.remove('fa-times');
    this.leftSideToggleBtn.classList.add('fa-compass');
  }
}

class UiTopMenuRightItem {
  constructor(node) {
    this.isOpen = false;
    this.node   = node;
    this.anchor = this.node.querySelector('a');
    this.ul     = this.node.querySelector('ul')
    if (this.ul) {
      this.anchor.classList.add('fa');
      this.anchor.classList.add('fa-caret-down');
      this.anchor.addEventListener('click', (evt) => {
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
    requestAnimationFrame(() => this.ul.style.opacity = 1);
  }

  close() {
    this.isOpen           = false;
    this.ul.style.opacity = 0;
    this.anchor.classList.remove('fa-caret-up');
    this.anchor.classList.add('fa-caret-down');
    setTimeout(() => this.ul.style.display = 'none', 400);
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
    this.node.style.left = '-48mm';
  }
}

window.addEventListener('DOMContentLoaded', () => new UiLayout());
