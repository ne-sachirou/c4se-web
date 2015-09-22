export class SoundPlayer {
  constructor() {
    this._context    = new (window.AudioContext || window.webkitAudioContext)();
    this._bgmContext = new BGMContext(this._context, document.getElementById('music'));
  }

  playBGM(src) {
    return this._bgmContext.play(src);
  }

  playSE(audio) {
    var eventEmitter = new SoundPlayerEventEmitter();
    var source = this._context.createBufferSource();
    source.connect(this._context.destination);
    source.onended = () => eventEmitter.emit('ended');
    this._context.decodeAudioData(audio, (buffer) => {
      source.buffer = buffer;
      source.start();
    });
    return eventEmitter;
  }
}

class BGMContext {
  constructor(context, audioNode) {
    this._audioNode      = audioNode;
    this._canplaythrough = null;
    this._ended          = null;
    audioNode.autoplay = false;
    audioNode.loop     = false;
    var source = context.createMediaElementSource(audioNode);
    source.connect(context.destination);
  }

  play(src) {
    var me = this;
    var eventEmitter = new SoundPlayerEventEmitter();

    function canplaythrough() {
      me._canplaythrough = null;
      me._audioNode.removeEventListener(canplaythrough);
      me._audioNode.play();
    }

    function ended() {
      me._audioNode.removeEventListener(ended);
      me._ended = null;
      eventEmitter.emit('ended');
    }

    if (this._canplaythrough) {
      this._audioNode.removeEventListener(this._canplaythrough);
    }
    this._canplaythrough = canplaythrough;
    this._audioNode.addEventListener('canplaythrough', canplaythrough);
    if (this._ended) {
      this._audioNode.removeEventListener(this._ended);
    }
    this._ended = ended;
    this._audioNode.addEventListener('ended', ended);
    this._audioNode.src = src;
    this._audioNode.load();
    return eventEmitter;
  }
}

class SoundPlayerEventEmitter {
  constructor() {
    this._handlers = {
      ended: [],
    };
  }

  on(eventName, handler) {
    this._handlers[eventName].push(handler);
  }

  emit(eventName, args) {
    for (let handler of this._handlers[eventName]) {
      handler.apply(this, args);
    }
  }
}
