/* jshint browser:true, strict:false */

class UiMenu {
  constructor() {
    this.menu          = document.querySelector('.main_menu');
    this.menuToggleBtn = this.menu.querySelector('.main_menu_toggleBtn');
    this.isOpen        = false;
    this.menuToggleBtn.addEventListener('click', () => {
      if (this.isOpen) {
        this.close();
      } else {
        this.open();
      }
    });
  }

  open() {
    this.isOpen = true;
    this.menu.style.left = 0;
    this.menuToggleBtn.style.transform = 'rotate(180deg)';
  }

  close() {
    this.isOpen = false;
    this.menu.style.left = '-48mm';
    this.menuToggleBtn.style.transform = 'rotate(0)';
  }
}

window.addEventListener('DOMContentLoaded', () => new UiMenu());
