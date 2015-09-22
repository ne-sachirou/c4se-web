export class SoundPlayer {
  constructor() {
    this._context      = new (window.AudioContext || window.webkitAudioContext || window.mozAudioContext)();
    this._musicContext = new MusicContext(this._context, document.getElementById('music'));
  }

  playMusic(src) {
    return this._musicContext.play(src);
  }

  playSE(audio) {
    var eventEmitter = new SoundPlayerEventEmitter();
    var source       = this._context.createBufferSource();
    source.loop = false;
    source.connect(this._context.destination);
    source.onended = () => eventEmitter.emit('ended');
    this._context.decodeAudioData(audio, (buffer) => {
      source.buffer = buffer;
      source.start();
    }, (err) => eventEmitter.emit('error', [err]));
    return eventEmitter;
  }
}

class MusicContext {
  constructor(context, audioNode) {
    var source = context.createMediaElementSource(audioNode);
    this._audioNode = audioNode;
    this._handler   = {
      canplaythrough: null,
      error         : null,
      ended         : null,
    };
    audioNode.autoplay = false;
    audioNode.loop     = false;
    source.connect(context.destination);
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
