/* eslint-env mocha */
const path = require('path');
const { expect } = require('chai');
const Config = require('../index.js');
const fs = require('fs');

describe('Main', () => {
  describe('Loading', () => {
    it('should load files asynchronously', (done) => {
      const conf = new Config();
      conf.load(path.join(__dirname, 'configs', 'default.json')).then(() => {
        const name = conf.get('Name');
        expect(name).to.equal('John');
        done();
      });
    });

    it('should load files synchronously', () => {
      const conf = new Config();
      conf.loadSync(path.join(__dirname, 'configs', 'default.json'));
      const name = conf.get('Name');
      expect(name).to.equal('John');
    });
  });

  describe('Access', () => {
    it('should access object properties', (done) => {
      const conf = new Config();
      conf.load(path.join(__dirname, 'configs', 'default.json')).then(() => {
        const name = conf.get('Object.Name');
        expect(name).to.equal('Jake');
        done();
      });
    });

    it('should access arrays', (done) => {
      const conf = new Config();
      conf.load(path.join(__dirname, 'configs', 'default.json')).then(() => {
        const values = conf.get('Values');
        expect(values).to.deep.equal([1, 2, 3, 9, 7, 8]);
        done();
      });
    });

    it('should set and keep values', (done) => {
      const conf = new Config();
      conf.load(path.join(__dirname, 'configs', 'default.json')).then(() => {
        let float = conf.get('Float');
        expect(float).to.equal(0.01);
        conf.set('Float', 23.4);
        float = conf.get('Float');
        expect(float).to.equal(23.4);
        done();
      });
    });

    it('should not set undefined', (done) => {
      const conf = new Config();
      conf.load(path.join(__dirname, 'configs', 'default.json')).then(() => {
        let float = conf.get('Float');
        expect(float).to.equal(0.01);
        conf.set('Float', undefined);
        float = conf.get('Float');
        expect(float).to.equal(0.01);
        done();
      });
    });

    it('should deny setting when locked', (done) => {
      const conf = new Config();
      conf.load(path.join(__dirname, 'configs', 'default.json')).then(() => {
        const float = conf.get('Float');
        expect(float).to.equal(0.01);
        conf.lock();
        conf.set('Float', 23.4);
        expect(conf.get('Float')).to.equal(0.01);
        conf.unlock();
        conf.set('Float', 23.4);
        expect(conf.get('Float')).to.equal(23.4);
        done();
      });
    });
  });

  describe('Saving', () => {
    it('should save files asynchronously', (done) => {
      const conf = new Config();
      conf.load(path.join(__dirname, 'configs', 'default.json')).then(() => {
        conf.set('Name', 'Elizabeth');
        expect(conf.get('Name')).to.equal('Elizabeth');
        conf.save(path.join(__dirname, 'configs', 'saveAsync.json')).then(() => {
          // eslint-disable-next-line
          fs.access(path.join(__dirname, 'configs', 'saveAsync.json'), fs.F_OK | fs.R_OK, (err) => {
            if (err) {
              done(err);
            } else {
              conf.load(path.join(__dirname, 'configs', 'saveAsync.json')).then(() => {
                expect(conf.get('Name')).to.equal('Elizabeth');
                done();
              });
            }
          });
        });
      });
    });

    it('should save files synchronously', () => {
      const conf = new Config();
      conf.loadSync(path.join(__dirname, 'configs', 'default.json'));
      conf.set('Name', 'Elizabeth');
      expect(conf.get('Name')).to.equal('Elizabeth');
      conf.saveSync(path.join(__dirname, 'configs', 'saveSync.json'));
      // eslint-disable-next-line
      fs.accessSync(path.join(__dirname, 'configs', 'saveSync.json'), fs.F_OK | fs.R_OK);
      conf.loadSync(path.join(__dirname, 'configs', 'saveSync.json'));
      expect(conf.get('Name')).to.equal('Elizabeth');
    });
  });
});

