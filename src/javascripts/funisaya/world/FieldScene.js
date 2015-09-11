/* jssc maximumLineLength:1000 */
/* jshint browser:true, strict:false */
import {ResourceLoader} from './ResourceLoader.js';
import {Scene         } from './Scene.js';

export class FieldScene extends Scene {
  constructor(world) {
    super(world);
    var me = this;

    function loop() {
      if (!me.isLive) {
        return;
      }
      me._draw();
      window.requestAnimationFrame(loop);
    }

    this.isLive = true;
    this.context = world.canvas.getContext('2d');
    if (this.world.serialized.fieldScene) {
      this._deserialize(this.world.serialized.fieldScene);
    } else {
      this.map = FieldScene.maps.start;
    }
    loop();
  }

  destructor() {
    this.isLive = false;
    this.world.serialized.fieldScene = this._serialize();
  }

  _draw() {
    this.context.clearRect(0, 0, this.world.canvas.width, this.world.canvas.height);
    this.map.draw(this.context);
  }

  _serialize() {
    return {
      mapNer: this.map.ner,
    };
  }

  _deserialize(serialized) {
    this.map = FieldScene.maps[serialized.mapNer];
  }
}

FieldScene.maps          = {};
FieldScene.mats          = {};
FieldScene.interactables = {};
FieldScene.overlays      = {};

FieldScene.registerMap = (map) => FieldScene.maps[map.ner] = map;

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

class Map {
  constructor(mats, interactives, overlays, setting) {
    this.colNum       = mats.length;
    this.rowNum       = mats[0].length;
    this.mats         = mats;
    this.interactives = interactives;
    this.overlays     = overlays;
    this.ner          = setting.ner;
    this._isStarted   = false;
  }

  start() {
    this.mats = this.mats.map((row, y) => row.map((ner, x) => new MatItem([x, y], ner)));
  }

  draw(context) {
    if (!this._isStarted) {
      this._isStarted = true;
      this.start();
    }
    for (let row of this.mats) {
      for (let mat of row) {
        mat.draw(context);
      }
    }
  }
}

class MatItem {
  constructor(position, ner) {
    this.x     = position[0] * 32;
    this.y     = position[1] * 32;
    this.image = new ResourceLoader().resources[`${ner}.png`].resource;
  }

  draw(context) {
    context.drawImage(this.image, this.x, this.y);
  }
}

class InteractiveItem {
}

class OverlayItem {
}

class DarkMatItem extends MatItem {
}
FieldScene.registerMatItem(DarkMatItem);

FieldScene.registerMap(new Map(
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
    [[0, 0], 'tree'],
  ],
  {
    ner: 'start',
    bgm: 'qwertyuiop.ogg',
  }
));
