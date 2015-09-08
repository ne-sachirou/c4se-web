export class World {
  constructor() {
    this.canvas = document.getElementById('world');
    this.scene = new LoadingScene(this);
  }

  loadData() {
    return new Promise((resolve, reject) => {
      resolve();
    });
  }

  saveData() {
    return new Promise((resolve, reject) => {
      resolve();
    });
  }

  nextScene(sceneClass) {
    this.scene = new sceneClass(this);
  }
}

class ResourceLoader {
  constructor() {
  }

  loadInitialResources() {
    return Promise.all(ResourceLoader.initialResources.map((r) => r.load()));
  }

  loadSet(name) {
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
}

class LoadingScene extends Scene {
  constructor(world) {
    console.log('Loading');
    super(world);
    this.init();
  }

  destructor() {
    var node = document.getElementsByClassName('loadingScene')[0];
    node.parentNode.removeChild(node);
  }

  async init() {
    var node = document.importNode(document.getElementById('loadingScene').content, true).firstElementChild;
    document.body.appendChild(node);
    await new ResourceLoader().loadSet('init');
    await this.world.loadData();
    this.destructor();
    this.world.nextScene(FieldScene);
  }
}

class FieldScene extends Scene {
  constructor(world) {
    console.log('Field');
    super(world);
  }
}
