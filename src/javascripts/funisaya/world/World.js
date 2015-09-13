import {FieldScene    } from './FieldScene.js';
import {ResourceLoader} from './ResourceLoader.js';
import {Scene         } from './Scene.js';

export class World {
  constructor() {
    var me = this;

    function adjustCanvas() {
      me.canvas.height = window.innerHeight;
      me.canvas.width  = window.innerWidth;
    }

    this.canvas     = document.getElementById('world');
    this.scene      = new LoadingScene(this);
    this.serialized = {};
    window.addEventListener('resize', adjustCanvas);
    adjustCanvas();
    window.addEventListener('unload', () => {
      this.scene.destructor();
      this.saveData();
    });
    window.addEventListener('click'   , (evt) => this.scene.onClick(evt));
    window.addEventListener('keydown' , (evt) => this.scene.onKeyDown(evt));
    window.addEventListener('keypress', (evt) => this.scene.onKeyPress(evt));
    window.addEventListener('keyup'   , (evt) => this.scene.onKeyUp(evt));
  }

  loadData() {
    return new Promise((resolve, reject) => {
      this.serialized = {};
      resolve();
    });
  }

  saveData() {
    console.log(this.serialized);
    return new Promise((resolve, reject) => {
      resolve();
    });
  }

  nextScene(sceneClass) {
    this.scene.destructor();
    this.scene = new sceneClass(this);
  }
}

class LoadingScene extends Scene {
  constructor(world) {
    super(world);
    this._init();
  }

  destructor() {
    super.destructor();
    var node = document.getElementsByClassName('loadingScene')[0];
    node.parentNode.removeChild(node);
  }

  async _init() {
    var node = document.importNode(document.getElementById('loadingScene').content, true).firstElementChild;
    document.body.appendChild(node);
    await ResourceLoader.loadSet('init');
    await this.world.loadData();
    this.world.nextScene(FieldScene);
  }
}
