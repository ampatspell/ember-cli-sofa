import Ember from 'ember';
import { module as qmodule, skip } from 'qunit';
import { test as qtest, only as qonly } from 'ember-qunit';
import startApp from './start-app';
import extendAssert from './extend-assert';
import params from './params';

const {
  RSVP: { Promise, resolve },
  Logger: { error },
  run,
  String: { dasherize }
} = Ember;

let app;
let container;
let stores = [];

export function module(name, cb) {
  qmodule(name, {
    beforeEach: function(assert) {
      let done = assert.async();
      app = startApp();
      container = app.__container__;
      resolve().then(function() {
        return cb(container);
      }).then(function() {
        done();
      });
    },
    afterEach: function() {
      run(() => {
        stores.forEach(store => {
          store.destroy();
        });
        stores = [];
        app.destroy();
      });
    },
  });
}

function q(fn, name, cb) {
  return fn(name, function(assert) {
    extendAssert(assert);
    let done = assert.async();
    resolve().then(function() {
      return cb(assert);
    }).then(function() {
      done();
    }, function(err) {
      error(err);
      error(err.stack);
      assert.deepEqual("--see-the-error--", err);
      done();
    });
  });
}

export function test(name, cb) {
  return q(qtest, name, cb);
}

export function only(name, cb) {
  return q(qonly, name, cb);
}

test.only = only;
test.skip = skip;

export function next(arg) {
  return new Promise(function(resolve) {
    run.next(function() {
      resolve(arg);
    });
  });
}

function defaultDelay(delay) {
  return delay || parseInt(params.delay) || 250;
}

export function wait(arg, delay) {
  delay = defaultDelay(delay);
  return new Promise(function(resolve) {
    run.later(function() {
      resolve(arg);
    }, delay);
  });
}

export function createStore() {
  let Store = container.lookup('sofa:store').extend({
    databaseOptionsForIdentifier(identifier) {
      let url = 'http://127.0.0.1:5984';
      if(identifier === 'main') {
        return { url, name: 'ember-cli-sofa-test-main' };
      }
    }
  });
  let store = Store.create();
  stores.push(store);
  return store;
}

export function registerModels(hash) {
  for(let name in hash) {
    let Class = hash[name];
    let normalizedName = dasherize(name);
    app.register(`model:${normalizedName}`, Class, { instantiate: false });
  }
}
