import Ember from 'ember';
import { forwardCall } from './computed';
import InternalDatabase from './internal/internal-database';

const {
  getOwner,
  computed: { oneWay }
} = Ember;

let call = forwardCall('_internal');

let prop = (name) => {
  return oneWay(`_internal.${name}`).readOnly();
};

export function createDatabase(internalStore, identifier, documents) {
  let store = internalStore.store;
  let internal = new InternalDatabase(store, internalStore, identifier, documents);
  let database = getOwner(store).lookup('sofa:database').create({ _internal: internal });
  internal.database = database;
  return database;
}

export default Ember.Object.extend({

  _internal: null,

  store:      prop('store'),
  identifier: prop('identifier'),
  documents:  prop('documents'),

  modelClassForName: call('modelClassForName'),
  model:             call('model'),
  push:              call('push'),

});
