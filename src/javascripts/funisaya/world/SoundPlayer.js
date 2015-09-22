export class SoundPlayer {
  constructor() {
    this._context   = new (window.AudioContext || window.webkitAudioContext)();
    this._audioNode = document.getElementById('music');
    {
      let source = this._context.createMediaElementSource(this._audioNode);
      source.connect(this._context.destination);
    }
  }

  playBGM(src) {
    this._audioNode.src = src;
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
