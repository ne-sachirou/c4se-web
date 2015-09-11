class Resource {
  constructor(ner) {
    this.ner      = ner;
    this.resource = null;
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
    return new Promise((resolve, reject) => {
      resolve(this);
    });
  }
}

export class ResourceLoader {
  constructor() {
    if (ResourceLoader._instance) {
      return ResourceLoader._instance;
    }
    ResourceLoader._instance = this;
    this.resources = {};
  }

  loadSet(ner) {
    return Promise.all(
      ResourceLoader.resourceSets[ner].map((resource) => {
        if (this.resources[resource.ner]) {
          return Promise.resolve(this.resources[resource.ner]);
        } else {
          return resource.load().then(() => {
            this.resources[resource.ner] = this.resources[resource.ner] || resource;
            return this.resources[resource.ner];
          });
        }
      })
    );
  }
}

ResourceLoader._instance = null;

ResourceLoader.resourceSets = {
  init: [
    // new ImageResource('charactorFrontLeft.png'),
    // new ImageResource('charactorFrontMiddle.png'),
    // new ImageResource('charactorFrontRight.png'),
    // new ImageResource('charactorLeftSideLeft.png'),
    // new ImageResource('charactorLeftSideMiddle.png'),
    // new ImageResource('charactorLeftSideRight.png'),
    // new ImageResource('charactorRightSideLeft.png'),
    // new ImageResource('charactorRightSideMiddle.png'),
    // new ImageResource('charactorRightSideRight.png'),
    new ImageResource('Dark.png'),
  ],
};
