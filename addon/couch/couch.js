import Ember from 'ember';
import { object } from '../util/computed';

const {
  computed,
  getOwner,
  assert,
  typeOf
} = Ember;

const normalizedUrl = () => {
  return computed('url', function() {
    let url = this.get('url');
    if(!url) {
      return url;
    }
    if(!url.endsWith('/')) {
      url = `${url}/`;
    }
    return url;
  }).readOnly();
};

const session = () => {
  return computed(function() {
    return getOwner(this).factoryFor('couch:session').create({ couch: this });
  }).readOnly();
};

export default Ember.Object.extend({

  url: null,
  normalizedUrl: normalizedUrl(),

  openDatabases: object(),

  session: session(),

  _request: computed(function() {
    return getOwner(this).factoryFor('couch:request').create();
  }).readOnly(),

  request(opts) {
    let url = this.get("normalizedUrl");
    assert("Extend sofa Store and set url property", typeOf(url) !== 'null');
    opts = opts || {};
    opts.url = opts.url ? [url, opts.url].join('') : url;
    return this.get('_request').send(opts);
  },

  info() {
    return this.request({
      type: 'get',
      json: true
    }).then(null, null, 'sofa:couch info');
  },

  uuids(count) {
    return this.request({
      type: 'get',
      url: '_uuids',
      qs: {
        count: count || 1
      },
      json: true
    }).then(null, null, 'sofa:couch uuids');
  },

  createDatabase(name) {
    let couch = this;
    return getOwner(this).factoryFor('couch:database').create({ couch, name });
  },

  database(name) {
    let dbs = this.get('openDatabases');
    let db = dbs[name];
    if(!db) {
      db = this.createDatabase(name);
      dbs[name] = db;
    }
    return db;
  },

  db: computed(function() {
    let couch = this;
    return getOwner(this).factoryFor('couch:databases').create({ couch });
  }).readOnly(),

  willDestroy() {
    this.get('_request').destroy();
    this._super();
  }

});
