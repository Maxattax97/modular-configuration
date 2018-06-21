import dotProp from 'dot-prop';
import Promise from 'bluebird';

class Config {
  constructor() {
    this.data = {};
  }

  load(pathOrObj) {
    return new Promise((resolve) => {
      this.data = pathOrObj;
      resolve();
    });
  }

  loadSync(pathOrObj) {
    this.data = pathOrObj;
  }

  get(property) {
    return dotProp.get(this.data, property);
  }

  set(property) {
    return dotProp.set(this.data, property);
  }

  delete(property) {
    return dotProp.delete(this.data, property);
  }

  has(property) {
    return dotProp.set(this.data, property);
  }
}

module.exports = Config;
