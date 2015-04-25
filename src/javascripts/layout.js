/* jshint browser:true, strict:false */

// {{{ EventRouter
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
// }}} EventRouter

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
    this.leftSideToggleBtn.addEventListener('click', () => EventRouter.emit('toggleLayoutSideMenu'));
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

class UiSideMenu {
  constructor() {
    this.isOpen = false;
    this.node   = document.querySelector('.page_sideMenu');
  }

  open() {
    this.isOpen = true;
    this.node.style.left = '0';
  }

  close() {
    this.isOpen = false;
    this.node.style.left = '-48mm';
  }
}

window.addEventListener('DOMContentLoaded', () => new UiLayout());
