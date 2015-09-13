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
      this.switchZurag(FieldScene.zurags.Start);
      this._charactor.moveTo(
        Math.floor(this._zurag.colNum / 2),
        Math.floor(this._zurag.rowNum / 2)
      );
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
    {
      let transformX = (this.world.canvas.width / 2) - (this._charactor.x - 24);
      let transformY = (this.world.canvas.height / 2) - (this._charactor.y - 24);
      if (transformX > 0) {
        transformX = 0;
      } else if (this.world.canvas.width - transformX > this._zuragCanvas.width) {
        transformX = this.world.canvas.width - this._zuragCanvas.width;
      }
      if (transformY > 0) {
        transformY = 0;
      } else if (this.world.canvas.height - transformY > this._zuragCanvas.height) {
        transformY = this.world.canvas.height - this._zuragCanvas.height;
      }
      this._context.drawImage(this._zuragCanvas, transformX, transformY);
    }
  }

  onKeyDown(evt) {
    var nextCol   = this._charactor.col;
    var nextRow   = this._charactor.row;
    var isMovable = () => {
      var nextMat = this._zurag.mats[nextRow] ? this._zurag.mats[nextRow][nextCol] : void 0;
      return nextMat && nextMat.isPassable;
    };
    switch (evt.keyCode) {
      case 37: // ←
        evt.preventDefault();
        --nextCol;
        if (isMovable()) {
          this._charactor.moveLeft();
        }
        break;
      case 38: // ↑
        evt.preventDefault();
        --nextRow;
        if (isMovable()) {
          this._charactor.moveUp();
        }
        break;
      case 39: // →
        evt.preventDefault();
        ++nextCol;
        if (isMovable()) {
          this._charactor.moveRight();
        }
        break;
      case 40: // ↓
        evt.preventDefault();
        ++nextRow;
        if (isMovable()) {
          this._charactor.moveDown();
        }
        break;
    }
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
    this.col              = 0;
    this.row              = 0;
    this.x                = 0;
    this.y                = 0;
    this.imageFrontMiddle = ResourceLoader.resources['CharactorFrontMiddle.png'].resource;
    this._isMoving        = false;
  }

  draw(context) {
    context.drawImage(this.imageFrontMiddle, this.x, this.y);
  }

  moveUp() {
    if (this._isMoving) {
      return;
    }
    this.moveTo(this.col, this.row - 1);
  }

  moveRight() {
    if (this._isMoving) {
      return;
    }
    this.moveTo(this.col + 1, this.row);
  }

  moveDown() {
    if (this._isMoving) {
      return;
    }
    this.moveTo(this.col, this.row + 1);
  }

  moveLeft() {
    if (this._isMoving) {
      return;
    }
    this.moveTo(this.col - 1, this.row);
  }

  moveTo(col, row) {
    const DURATION = 200;
    if (Math.abs(this.col - col) <= 1 && Math.abs(this.row - row) <= 1) {
      let startX  = this.x;
      let startY  = this.y;
      let endX    = col * 48;
      let endY    = row * 48;
      let startAt = Date.now();
      let loop    = () => {
        var now = Date.now();
        this.x = Math.sin((now - startAt) * (Math.PI / 2) / DURATION) * (endX - startX) + startX;
        this.y = Math.sin((now - startAt) * (Math.PI / 2) / DURATION) * (endY - startY) + startY;
        if (now >= startAt + DURATION) {
          this.x = endX;
          this.y = endY;
          this._isMoving = false;
        } else {
          window.requestAnimationFrame(loop);
        }
      };
      this._isMoving = true;
      this.col = col;
      this.row = row;
      loop();
    } else {
      this.col = col;
      this.row = row;
      this.x = col * 48;
      this.y = row * 48;
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
    this.image = ResourceLoader.resources['Dark.png'].resource;
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
    ner: 'Start',
    bgm: 'qwertyuiop.ogg',
  }
));
