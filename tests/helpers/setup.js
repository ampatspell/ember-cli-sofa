import Ember from 'ember';
import { module as qmodule, skip } from 'qunit';
import { test as qtest, only as qonly, todo as qtodo } from 'ember-qunit';
import startApp from './start-app';
import extendAssert from './extend-assert';
import params from './params';

import globalOptions from 'sofa/util/global-options';

const {
  RSVP: { Promise, resolve, all },
  Logger: { info, error },
  run,
  String: { dasherize },
  copy,
  merge,
  setOwner
} = Ember;

const configs = {
  '1.6': {
    url: '/api/1.6'
  },
  '2.0': {
    url: '/api/2.0'
  }
};

let app;
let container;
let stores = [];

function setupGlobalOptions() {
  globalOptions.autoload.internalModel = false;
  globalOptions.autoload.persistedArray = false;
}

export function module(name, cb) {
  qmodule(name, {
    beforeEach: function(assert) {
      window.currentTestName = `${name}: ${assert.test.testName}`;
      info(`→ ${window.currentTestName}`);
      setupGlobalOptions();
      let done = assert.async();
      app = startApp();
      container = app.__container__;
      resolve().then(function() {
        return cb(container);
      }).then(function() {
        done();
      });
    },
    afterEach: function(assert) {
      let done = assert.async();
      run(() => {
        stores.forEach(store => {
          store.destroy();
        });
        stores = [];
        app.destroy();
        run.next(() => {
          done();
        });
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
      assert.ok(false, err.stack);
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

export function todo(name, cb) {
  return q(qtodo, name, cb);
}

test.only = only;
test.skip = skip;
test.todo = todo;

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

export const baseURL = configs['2.0'].url;

export function createStore(url = baseURL) {
  let Store = container.factoryFor('sofa:store').class.extend({
    databaseOptionsForIdentifier(identifier) {
      if(identifier === 'main') {
        return { url, name: 'ember-cli-sofa-test-main' };
      } else if(identifier === 'second') {
        return { url, name: 'ember-cli-sofa-test-second' };
      }
    }
  });
  let store = Store.create();
  setOwner(store, container);
  stores.push(store);
  return store;
}

function registerHash(prefix, hash) {
  for(let name in hash) {
    let Class = hash[name];
    let normalizedName = dasherize(name);
    app.register(`${prefix}:${normalizedName}`, Class, { instantiate: false });
  }
}

export function registerQueries(hash) {
  registerHash('query', hash);
}

export function registerModels(hash) {
  registerHash('model', hash);
}

export function registerCollections(hash) {
  registerHash('collection', hash);
}

export const admin = {
  name: 'ampatspell',
  password: 'hello'
};

export function login(db) {
  return db.get('documents.couch.session').save(admin.name, admin.password);
}

export function logout(db) {
  return db.get('documents.couch.session').delete();
}

export function recreate(db) {
  let docs = db.get('documents');
  return login(db).then(() => {
    return docs.get('database').create({ optional: true });
  }).then(() => {
    return docs.all();
  }).then(json => {
    return all(json.rows.map(row => {
      return docs.delete(row.id, row.value.rev);
    }));
  });
}

export function cleanup(store, databaseNames) {
  return all(databaseNames.map(name => {
    return recreate(store.database(name));
  }));
}

function withoutUndefined(opts) {
  let res = {};
  for(let key in opts) {
    let value = opts[key];
    if(value !== undefined) {
      res[key] = value;
    }
  }
  return res;
}

function cleanupRequest(opts) {
  opts = copy(opts);
  if(opts.qs) {
    opts.qs = withoutUndefined(opts.qs);
    if(Object.keys(opts.qs).length === 0) {
      delete opts.qs;
    }
  }
  if(opts.body) {
    opts.body = withoutUndefined(opts.body);
  }
  return opts;
}

export function intercept(db) {
  let requests = [];
  let docs = db.get('documents');
  let request = docs.request;
  docs.request = function(opts) {
    requests.push(cleanupRequest(opts));
    return request.call(docs, opts);
  };
  return requests;
}


export function configurations(opts, fn) {
  if(typeof opts === 'function') {
    fn = opts;
    opts = {};
  }

  let invoke = (couch, url, config) => {
    fn({
      module(name, cb) {
        name = `${name} [${couch}]`;
        return module(name, cb);
      },
      test,
      createStore() {
        return createStore(url);
      },
      config
    });
  };

  let only = opts.only;
  if(!only) {
    only = [];
  } else if(typeof only === 'string') {
    only = [ only ];
  }

  for(let key in configs) {
    if(only.length > 0 && only.indexOf(key) === -1) {
      continue;
    }
    let value = configs[key];
    invoke(key, value.url, merge({ name: key }, value));
  }
}
