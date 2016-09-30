import Ember from 'ember';
import InternalStore from './internal/internal-store';
import { lookup, createInternal, forwardCall } from './computed';

const lookupWithStore = (name) => {
  return lookup(name, function() {
    return { store: this };
  });
};

let call = forwardCall('_internal');

export default Ember.Service.extend({

  _internal: createInternal(InternalStore),

  database: call('database'),
  db: lookupWithStore('sofa:databases'),

  modelClassForName: call('modelClassForName'),
  model: call('createModelForName'),

  find() {
    console.warn(this+'', '`find`', ...arguments);
  },

  willDestroy() {
  }

});
