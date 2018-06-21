const fs = require('fs');
const Promise = require('bluebird');
const dotProp = require('dot-prop');

class Config {
  constructor() {
    this.data = {};
    this.log = [];
    this.locked = false;
    this.environment = 'default';
    this.configDir = `${process.cwd()}/config`;
    this.instance = 0;
    this.readEnvironment();
  }

  load(pathOrObj) {
    return new Promise((resolve, reject) => {
      if (typeof pathOrObj === 'object') {
        this.log.push({
          type: 'object',
          contents: pathOrObj,
        });
        this.data = pathOrObj;
        resolve();
      } else if (typeof pathOrObj === 'string') {
        fs.readFile(pathOrObj, (err, data) => {
          if (err) {
            reject(err);
          } else {
            try {
              const parsed = JSON.parse(data.toString());
              this.log.push({
                type: 'file',
                path: pathOrObj,
                contents: parsed,
              });
              this.overlay(parsed);
              resolve();
            } catch (err2) {
              reject(err2);
            }
          }
        });
      } else {
        let instanceStr = '';
        if (this.instance !== 0 && this.instance !== '0') {
          instanceStr = `-${instanceStr}`;
        }

        this.load(`${this.configDir}${this.environment}${instanceStr}.json`)
          .then(resolve).catch(reject);
      }
    });
  }

  loadSync(pathOrObj) {
    if (typeof pathOrObj === 'object') {
      this.log.push({
        type: 'object',
        contents: pathOrObj,
      });
      this.overlay(pathOrObj);
    } else if (typeof pathOrObj === 'string') {
      const data = fs.readFileSync(pathOrObj);
      try {
        const parsed = JSON.parse(data.toString());
        this.log.push({
          type: 'file',
          path: pathOrObj,
          contents: parsed,
        });
        // this.data = parsed;
        this.overlay(parsed);
      } catch (err2) {
        throw err2;
      }
    } else {
      let instanceStr = '';
      if (this.instance !== 0 && this.instance !== '0') {
        instanceStr = `-${instanceStr}`;
      }

      this.loadSync(`${this.configDir}${this.environment}${instanceStr}.json`);
    }
  }

  overlay(obj) {
    Object.keys(obj).forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        if (obj[key] !== undefined) {
          this.data[key] = obj[key];
        }
      }
    });
  }

  readEnvironment() {
    if (process.env.NODE_CONFIG_ENV) {
      this.environment = process.env.NODE_CONFIG_ENV;
    }

    if (process.env.NODE_CONFIG_DIR) {
      this.configDir = process.env.NODE_CONFIG_DIR;
    }

    if (process.env.NODE_APP_INSTANCE) {
      this.instance = process.env.NODE_APP_INSTANCE;
    }
  }

  save(path) {
    return new Promise((resolve, reject) => {
      this.lock();
      fs.writeFile(path, JSON.stringify(this.data, null, 2), (err) => {
        this.unlock();
        if (err) {
          return reject(err);
        }
        return resolve();
      });
    });
  }

  saveSync(path) {
    this.lock();
    fs.writeFileSync(path, JSON.stringify(this.data, null, 2));
    this.unlock();
  }

  all() {
    return this.data;
  }

  get(property) {
    return dotProp.get(this.data, property);
  }

  set(property, value) {
    if ((!this.locked) && (value !== undefined)) {
      dotProp.set(this.data, property, value);
    }
  }

  delete(property) {
    if (!this.locked) {
      dotProp.delete(this.data, property);
    }
  }

  has(property) {
    return dotProp.set(this.data, property);
  }

  lock() {
    this.locked = true;
  }

  unlock() {
    this.locked = false;
  }
}

module.exports = Config;
