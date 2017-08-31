import Ember from 'ember';
import { module as qmodule, skip } from 'qunit';
import { test as qtest, only as qonly } from 'ember-qunit';
import startApp from './start-app';
import extendAssert from './extend-assert';

const {
  RSVP: { Promise, resolve, reject, all },
  Logger: { info, error },
  run,
  merge,
  String: { dasherize },
  copy
} = Ember;

const configs = {
  '1.6': {
    url: '/api/1.6',
    name: 'ember-cli-couch',
    feed: 'event-source'
  },
  '2.0': {
    url: '/api/2.0',
    name: 'ember-cli-couch',
    feed: 'long-polling'
  }
};

export const admin = {
  name: 'admin',
  password: 'hello'
};

const _catch = err => {
  error(err);
  error(err.stack);
  return reject(err);
};

const makeModule = (name, cb, config, state) => {
  qmodule(name, {
    beforeEach(assert) {
      window.currentTestName = `${name}: ${assert.test.testName}`;
      info(`→ ${window.currentTestName}`);
      let done = assert.async();
      state.start(config).then(() => cb()).catch(_catch).finally(() => done());
    },
    afterEach(assert) {
      let done = assert.async();
      state.destroy().catch(_catch).finally(() => done());
    },
  });
}

class State {
  constructor() {
    this.keys = [];
    this.baseURL = configs['2.0'].url;
    this.storeIdentifier = 0;
    this.stores = [];
  }
  start(config) {
    this.application = startApp();
    this.instance = this.application.buildInstance();
    return this.once(config);
  }
  _createSystemDatabases(config) {
    let store = this.createStore(config.url);
    let couch = store.get('db.main.couch.documents');
    let dbs = [ '_global_changes', '_metadata', '_replicator', '_users' ];
    return resolve()
      .then(() => couch.get('session').save(admin.name, admin.password))
      .then(() => all(dbs.map(name => couch.database(name).get('database').create({ optional: true }))));
  }
  _once(config) {
    if(config.key === '2.0') {
      return this._createSystemDatabases(config);
    }
    return resolve();
  }
  once(config) {
    let { key } = config;
    if(this.keys.includes(key)) {
      return resolve();
    }
    this.keys.push(key);
    return this._once(config);
  }
  destroy() {
    return next().then(() => {
      this.stores.forEach(store => store.destroy());
      this.stores = [];
    }).then(() => {
      this.instance.destroy();
      this.instance = null;
      this.application.destroy();
      this.application = null;
    });
  }
  createStore(url=this.baseURL) {
    let Store = this.instance.factoryFor('sofa:store').class.extend({
      _isAutoloadInternalModelEnabled: false,
      _isAutoloadPersistedArrayEnabled: false,
      databaseOptionsForIdentifier(identifier) {
        if(identifier === 'main') {
          return { url, name: 'ember-cli-sofa-test-main' };
        } else if(identifier === 'second') {
          return { url, name: 'ember-cli-sofa-test-second' };
        }
      }
    });
    let key = `sofa:store/test/${this.storeIdentifier++}`;
    this.instance.register(key, Store);
    Store = this.instance.factoryFor(key);
    let store = Store.create();
    this.stores.push(store);
    return store;
  }
}

let state = new State();

export function configurations(opts, body) {
  if(typeof opts === 'function') {
    body = opts;
    opts = {};
  }

  let only = opts.only || [];
  if(typeof only === 'string') {
    only = [ only ];
  }

  for(let key in configs) {
    if(only.length > 0 && only.indexOf(key) === -1) {
      continue;
    }
    let config = merge({ key }, configs[key]);
    body({
      config,
      state,
      test,
      module(name, cb) {
        return makeModule(`${name} [${config.key}]`, cb, config, state)
      },
      createStore() {
        return state.createStore(config.url);
      }
    });
  }
}

function q(fn, name, cb) {
  return fn(name, assert => {
    extendAssert(assert);
    let done = assert.async();
    resolve().then(() => cb(assert)).catch(err => {
      error(err);
      error(err.stack);
      assert.ok(false, err.stack);
    }).finally(() => done());
  });
}

function test(name, cb) {
  return q(qtest, name, cb);
}

function only(name, cb) {
  return q(qonly, name, cb);
}

test.only = only;
test.skip = skip;

export const next = arg => new Promise(resolve => run.next(() => resolve(arg)));

export const wait = (arg, delay) => new Promise(resolve => run.later(() => resolve(arg), delay));

export const login = db => db.get('documents.couch.session').save(admin.name, admin.password);

export const logout = db => db.get('documents.couch.session').delete();

export const recreate = db => login(db).then(() => db.get('documents.database').recreate({ design: true }));

export const cleanup = (store, dbNames) => all(dbNames.map(dbName => recreate(store.database(dbName))));

export const waitFor = fn => {
  let start = new Date();
  return new Promise((resolve, reject) => {
    let i = setInterval(() => {
      if(fn()) {
        resolve();
        clearInterval(i);
      } else {
        let now = new Date();
        if(now - start > 20000) {
          reject(new Error('took more than 20 seconds'));
          clearInterval(i);
        }
      }
    }, 50);
  });
}

function registerHash(prefix, hash) {
  for(let name in hash) {
    let Class = hash[name];
    let normalizedName = dasherize(name);
    state.instance.register(`${prefix}:${normalizedName}`, Class, { instantiate: false });
  }
}

export function registerQueries(hash) {
  registerHash('query', hash);
}

export function registerRelationships(hash) {
  registerHash('relationship', hash);
}

export function registerModels(hash) {
  registerHash('model', hash);
}

export function registerChanges(hash) {
  registerHash('sofa/changes', hash);
}

export function register() {
  return state.instance.register(...arguments);
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
