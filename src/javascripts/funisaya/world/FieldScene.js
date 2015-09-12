/* jssc maximumLineLength:1000 */
/* jshint browser:true, strict:false */
import {ResourceLoader} from './ResourceLoader.js';
import {Scene         } from './Scene.js';

export class FieldScene extends Scene {
  constructor(world) {
    super(world);
    var me = this;

    function loop() {
      if (!me._isLive) {
        return;
      }
      me.draw();
      window.requestAnimationFrame(loop);
    }

    this._isLive             = true;
    this._context            = world.canvas.getContext('2d');
    this._zurag              = null;
    this._zuragCanvas        = null;
    this._zuragCanvasContext = null;
    this._charactor = new Charactor();
    if (this.world.serialized.fieldScene) {
      this._deserialize(this.world.serialized.fieldScene);
    } else {
      this.switchZurag(FieldScene.zurags.start);
      this._charactor.x = Math.floor(this._zurag.colNum / 2);
      this._charactor.y = Math.floor(this._zurag.rowNum / 2);
    }
    loop();
  }

  destructor() {
    this._isLive = false;
    this.world.serialized.fieldScene = this._serialize();
  }

  draw() {
    this._zuragCanvasContext.clearRect(0, 0, this._zuragCanvas.width, this._zuragCanvas.height);
    this._zurag.drawMats(this._zuragCanvasContext);
    this._zurag.drawInteractives(this._zuragCanvasContext);
    this._charactor.draw(this._zuragCanvasContext);
    this._zurag.drawOverlays(this._zuragCanvasContext);
    this._context.clearRect(0, 0, this.world.canvas.width, this.world.canvas.height);
    this._context.drawImage(
      this._zuragCanvas,
      -(this._zuragCanvas.width - this.world.canvas.width) / 2,
      -(this._zuragCanvas.height - this.world.canvas.height) / 2
    );
  }

  switchZurag(zurag) {
    this._zurag              = zurag;
    this._zuragCanvas        = document.createElement('canvas');
    this._zuragCanvasContext = this._zuragCanvas.getContext('2d');
    this._zuragCanvas.height = zurag.rowNum * 48;
    this._zuragCanvas.width  = zurag.colNum * 48;
  }

  _serialize() {
    return {
      zuragNer: this._zurag.ner,
    };
  }

  _deserialize(serialized) {
    this._zurag = FieldScene.zurags[serialized.zuragNer];
  }
}

FieldScene.zurags        = {};
FieldScene.mats          = {};
FieldScene.interactables = {};
FieldScene.overlays      = {};

FieldScene.registerZurag = (zurag) => FieldScene.zurags[zurag.ner] = zurag;

FieldScene.registerMatItem = (itemClass) => {
  var ner = itemClass.name.slice(0, -'MatItem'.length);
  itemClass.ner = ner;
  FieldScene.mats[ner] = itemClass;
};

FieldScene.registerInteractiveItem = (itemClass) => {
  var ner = itemClass.name.slice(0, -'InteractiveItem'.length);
  itemClass.ner = ner;
  FieldScene.mats[ner] = itemClass;
};

FieldScene.registerOverlayItem = (itemClass) => {
  var ner = itemClass.name.slice(0, -'OverlayItem'.length);
  itemClass.ner = ner;
  FieldScene.mats[ner] = itemClass;
};

class Charactor {
  constructor() {
    this.x                = 0;
    this.y                = 0;
    this.imageFrontMiddle = new ResourceLoader().resources['CharactorFrontMiddle.png'].resource;
    this._isMoving        = false;
  }

  draw(context) {
    context.drawImage(this.imageFrontMiddle, this.x * 48, this.y * 48);
  }

  moveUp() {
    if (this._isMoving) {
      return;
    }
  }

  moveRight() {
    if (this._isMoving) {
      return;
    }
  }

  moveDown() {
    if (this._isMoving) {
      return;
    }
  }

  moveLeft() {
    if (this._isMoving) {
      return;
    }
  }
}

class Zurag {
  constructor(mats, interactives, overlays, setting) {
    this.colNum       = mats[0].length;
    this.rowNum       = mats.length;
    this.mats         = mats;
    this.interactives = interactives;
    this.overlays     = overlays;
    this.ner          = setting.ner;
    this._isStarted   = false;
    for (let row of mats) {
      if (row.length !== this.colNum) {
        throw new Error(`Zurag[${this.ner}].mats colNums [${mats.map((row) => row.length).join(',')}]`);
      }
    }
  }

  drawMats(context) {
    if (!this._isStarted) {
      this._isStarted = true;
      this._start();
    }
    for (let row of this.mats) {
      for (let mat of row) {
        mat.draw(context);
      }
    }
  }

  drawInteractives(context) {
  }

  drawOverlays(context) {
  }

  _start() {
    this.mats = this.mats.map((row, y) => row.map((ner, x) => new (FieldScene.mats[ner] || MatItem)(x, y)));
  }
}

/**
 * 48px x 48px
 */
class MatItem {
  constructor(x, y) {
    this.x          = x * 48;
    this.y          = y * 48;
    this.isPassable = true;
  }

  draw(context) {
  }
}

class InteractiveItem {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class OverlayItem {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class DarkMatItem extends MatItem {
  constructor(x, y) {
    super(x, y);
    this.image = new ResourceLoader().resources['Dark.png'].resource;
  }

  draw(context) {
    context.drawImage(this.image, this.x, this.y);
  }
}
FieldScene.registerMatItem(DarkMatItem);

FieldScene.registerZurag(new Zurag(
  [
    // 20x20
    ['Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark'],
    ['Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark'],
    ['Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark'],
    ['Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark'],
    ['Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark'],
    ['Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark'],
    ['Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark'],
    ['Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark'],
    ['Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark'],
    ['Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark'],
    ['Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark'],
    ['Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark'],
    ['Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark'],
    ['Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark'],
    ['Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark'],
    ['Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark'],
    ['Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark'],
    ['Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark'],
    ['Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark'],
    ['Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark','Dark'],
  ],
  [
  ],
  [
    [[0, 0], 'Tree'],
  ],
  {
    ner: 'start',
    bgm: 'qwertyuiop.ogg',
  }
));
