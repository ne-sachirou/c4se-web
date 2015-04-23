/* jshint browser:true, strict:false */

class UiMenu {
  constructor() {
    this.mainContent   = document.querySelector('.page_content');
    this.mainFooter    = document.querySelector('.page_footer');
    this.menu          = document.querySelector('.page_menu');
    this.menuToggleBtn = this.menu.querySelector('.page_menu_toggleBtn');
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
    this.isOpen                        = true;
    this.mainContent.style.left        = '60mm';
    this.mainFooter.style.left         = '60mm';
    this.menu.style.left               = 0;
    this.menuToggleBtn.style.transform = 'rotate(180deg)';
  }

  close() {
    this.isOpen                        = false;
    this.mainContent.style.left        = '12mm';
    this.mainFooter.style.left         = '12mm';
    this.menu.style.left               = '-48mm';
    this.menuToggleBtn.style.transform = 'rotate(0)';
  }
}

window.addEventListener('DOMContentLoaded', () => new UiMenu());
