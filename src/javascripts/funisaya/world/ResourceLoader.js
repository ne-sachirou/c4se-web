class Resource {
  constructor(ner) {
    this.ner      = ner;
    this.resource = null;
  }

  load() {
    throw new Error('Not Implemented');
  }
}

class ImageResource extends Resource {
  load() {
    var image = new Image();
    return new Promise((resolve, reject) => {
      image.onload = () => {
        this.resource = image;
        resolve(this);
      };
      image.onerror = () => reject();
      image.src = `/assets/funisaya/world/${this.ner}`;
    });
  }
}

class AudioResource extends Resource {
  load() {
    var req = new XMLHttpRequest();
    req.open('GET', `/assets/funisaya/world/${this.ner}`, true);
    req.responseType = 'arraybuffer';
    return new Promise((resolve, reject) => {
      req.onload = () => {
        this.resource = req.response;
        resolve(this);
      };
      req.onerror = (err) => reject(err);
      req.send();
    });
  }
}

export var ResourceLoader = {
  resources: {},

  resourceSets: {
    init: [
      // new ImageResource('CharactorFrontLeft.png'),
      new ImageResource('CharactorFrontMiddle.png'),
      // new ImageResource('CharactorFrontRight.png'),
      // new ImageResource('CharactorLeftSideLeft.png'),
      // new ImageResource('CharactorLeftSideMiddle.png'),
      // new ImageResource('CharactorLeftSideRight.png'),
      // new ImageResource('CharactorRightSideLeft.png'),
      // new ImageResource('CharactorRightSideMiddle.png'),
      // new ImageResource('CharactorRightSideRight.png'),
      new ImageResource('Dark.png'),
    ],
  },

  loadSet: function (ner) {
    return Promise.all(
      ResourceLoader.resourceSets[ner].map((resource) => {
        if (this.resources[resource.ner]) {
          return Promise.resolve(this.resources[resource.ner]);
        } else {
          return resource.load().then(() => {
            this.resources[resource.ner] = this.resources[resource.ner] || resource.resource;
            return this.resources[resource.ner];
          });
        }
      })
    );
  },
};
