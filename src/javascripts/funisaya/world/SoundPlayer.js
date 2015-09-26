export class SoundPlayer {
  constructor() {
    if (SoundPlayer._instance) {
      return SoundPlayer._instance;
    }
    SoundPlayer._instance = this;
    this._context      = new (window.AudioContext || window.webkitAudioContext)();
    this._master       = this._context.createDynamicsCompressor();
    this._musicContext = new MusicContext(this._context, this._master, document.getElementById('music'));
    this._master.connect(this._context.destination);
  }

  playMusic(src) {
    return this._musicContext.play(src);
  }

  playSE(audio) {
    var eventEmitter = new SoundPlayerEventEmitter();
    var source       = this._context.createBufferSource();
    source.loop = false;
    source.connect(this._master);
    source.onended = () => eventEmitter.emit('ended');
    this._context.decodeAudioData(audio, (buffer) => {
      source.buffer = buffer;
      source.start();
    }, (err) => eventEmitter.emit('error', [err]));
    return eventEmitter;
  }

  // cf. https://github.com/uupaa/WMAudioUtil.js/wiki/WMAudioUtil
  init() {
    const SILENT_M4A = [
      0,0,0,24,102,116,121,112,77,52,65,32,0,0,2,0,105,115,111,109,105,115,111,
      50,0,0,0,8,102,114,101,101,0,0,0,61,109,100,97,116,222,4,0,0,108,105,98,
      102,97,97,99,32,49,46,50,56,0,0,1,104,1,0,71,0,180,0,128,35,128,0,180,0,
      128,35,128,0,180,64,128,35,128,0,180,131,252,8,224,0,180,192,128,35,128,
      0,0,2,180,109,111,111,118,0,0,0,108,109,118,104,100,0,0,0,0,124,37,176,
      128,124,37,176,128,0,0,3,232,0,0,0,140,0,1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,
      1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,0,0,0,0,
      0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,0,0,1,224,116,114,
      97,107,0,0,0,92,116,107,104,100,0,0,0,15,124,37,176,128,124,37,176,128,0,
      0,0,1,0,0,0,0,0,0,0,140,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,1,0,0,0,0,0,0,
      0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,64,0,0,0,0,0,0,0,0,0,0,0,
      0,0,1,124,109,100,105,97,0,0,0,32,109,100,104,100,0,0,0,0,124,37,176,128,
      124,37,176,128,0,0,172,68,0,0,24,0,85,196,0,0,0,0,0,45,104,100,108,114,0,
      0,0,0,0,0,0,0,115,111,117,110,0,0,0,0,0,0,0,0,0,0,0,0,83,111,117,110,100,
      72,97,110,100,108,101,114,0,0,0,1,39,109,105,110,102,0,0,0,16,115,109,104,
      100,0,0,0,0,0,0,0,0,0,0,0,36,100,105,110,102,0,0,0,28,100,114,101,102,0,0,
      0,0,0,0,0,1,0,0,0,12,117,114,108,32,0,0,0,1,0,0,0,235,115,116,98,108,0,0,
      0,91,115,116,115,100,0,0,0,0,0,0,0,1,0,0,0,75,109,112,52,97,0,0,0,0,0,0,0,
      1,0,0,0,0,0,0,0,0,0,2,0,16,0,0,0,0,172,68,0,0,0,0,0,39,101,115,100,115,0,
      0,0,0,3,25,0,1,0,4,17,64,21,0,0,0,0,1,126,208,0,0,0,0,5,2,18,8,6,1,2,0,0,
      0,24,115,116,116,115,0,0,0,0,0,0,0,1,0,0,0,6,0,0,4,0,0,0,0,28,115,116,115,
      99,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,44,115,116,115,122,0,0,0,
      0,0,0,0,0,0,0,0,6,0,0,0,23,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,6,0,0,0,
      40,115,116,99,111,0,0,0,0,0,0,0,6,0,0,0,40,0,0,0,63,0,0,0,69,0,0,0,75,0,0,
      0,81,0,0,0,87,0,0,0,96,117,100,116,97,0,0,0,88,109,101,116,97,0,0,0,0,0,0,
      0,33,104,100,108,114,0,0,0,0,0,0,0,0,109,100,105,114,97,112,112,108,0,0,0,
      0,0,0,0,0,0,0,0,0,43,105,108,115,116,0,0,0,35,169,116,111,111,0,0,0,27,100,
      97,116,97,0,0,0,1,0,0,0,0,76,97,118,102,53,50,46,54,52,46,50
    ];
    var source = this._context.createBufferSource();
    return new Promise((resolve, reject) => {
      this._context.decodeAudioData(new Uint8Array(SILENT_M4A).buffer, (buffer) => {
        source.buffer = buffer;
        if (source) {
          source.start(0);
          source.stop(0);
          source = null;
        }
        resolve();
      }, (err) => {
        console.error(err);
        resolve();
      });
    });
  }
}

SoundPlayer._instance = null;

class MusicContext {
  constructor(context, master, audioNode) {
    var source = context.createMediaElementSource(audioNode);
    this._audioNode = audioNode;
    this._handler   = {
      canplaythrough: null,
      error         : null,
      ended         : null,
    };
    audioNode.autoplay = false;
    audioNode.loop     = false;
    source.connect(master);
  }

  play(src) {
    var me           = this;
    var eventEmitter = new SoundPlayerEventEmitter();

    function addEventListener(handler) {
      var eventName = handler.name;
      if (me._handler[eventName]) {
        me._audioNode.removeEventListener(eventName, me._handler[eventName]);
      }
      me._handler[eventName] = handler;
      me._audioNode.addEventListener(eventName, handler);
    }

    function canplaythrough() {
      me._handler.canplaythrough = null;
      me._audioNode.removeEventListener('canplaythrough', canplaythrough);
      me._audioNode.play();
    }

    function error() {
      me._handler.error = null;
      me._audioNode.removeEventListener('error', error);
      eventEmitter.emit('error');
    }

    function ended() {
      me._handler.ended = null;
      me._audioNode.removeEventListener('ended', ended);
      eventEmitter.emit('ended');
    }

    addEventListener(canplaythrough);
    addEventListener(error);
    addEventListener(ended);
    this._audioNode.src = src;
    this._audioNode.load();
    return eventEmitter;
  }
}

class SoundPlayerEventEmitter {
  constructor() {
    this._handlers = {
      ended: [],
      error: [],
    };
  }

  on(eventName, handler) {
    this._handlers[eventName].push(handler);
    return this;
  }

  emit(eventName, args = []) {
    for (let handler of this._handlers[eventName]) {
      handler.apply(this, args);
    }
  }
}
