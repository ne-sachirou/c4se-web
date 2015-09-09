export class World {
  constructor() {
    var me = this;

    function adjustCanvas() {
      me.canvas.height = window.innerHeight;
      me.canvas.width  = window.innerWidth;
    }

    this.canvas = document.getElementById('world');
    this.scene  = new LoadingScene(this);
    window.addEventListener('resize', adjustCanvas);
    adjustCanvas();
  }

  loadData() {
    return new Promise((resolve, reject) => {
      window.setTimeout(() => resolve(), 1000);
    });
  }

  saveData() {
    return new Promise((resolve, reject) => {
      resolve();
    });
  }

  nextScene(sceneClass) {
    this.scene.destructor();
    this.scene = new sceneClass(this);
  }
}

class ResourceLoader {
  constructor() {
  }

  loadSet(name) {
    return Promise.all(ResourceLoader.resourceSets[name].map((r) => r.load()));
  }
}

class LoadableResource {
  constructor(key) {
    this.key = key;
  }

  load() {
    return new Promise((resolve, reject) => {
      resolve(this);
    });
  }
}

class LoadableImageResource extends LoadableResource {
}

class LoadableAudioResource extends LoadableResource {
}

ResourceLoader.resourceSets = {
  init: [
    new LoadableImageResource('/assets/funisaya/world/charactorFrontLeft.png'),
    new LoadableImageResource('/assets/funisaya/world/charactorFrontMiddle.png'),
    new LoadableImageResource('/assets/funisaya/world/charactorFrontRight.png'),
    new LoadableImageResource('/assets/funisaya/world/charactorLeftSideLeft.png'),
    new LoadableImageResource('/assets/funisaya/world/charactorLeftSideMiddle.png'),
    new LoadableImageResource('/assets/funisaya/world/charactorLeftSideRight.png'),
    new LoadableImageResource('/assets/funisaya/world/charactorRightSideLeft.png'),
    new LoadableImageResource('/assets/funisaya/world/charactorRightSideMiddle.png'),
    new LoadableImageResource('/assets/funisaya/world/charactorRightSideRight.png'),
  ],
};

class Scene {
  constructor(world) {
    this.world = world;
  }

  destructor() {
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
    await new ResourceLoader().loadSet('init');
    await this.world.loadData();
    this.world.nextScene(FieldScene);
  }
}

class FieldScene extends Scene {
  constructor(world) {
    super(world);
    this._context = this.world.canvas.getContext('2d');
    this._context.fillStyle = 'white';
    this._context.fillRect(50, 50, 300, 200);
    this._context.clearRect(120, 80, 200, 140);
    this._context.strokeRect(200, 20, 180, 260);
  }
}
