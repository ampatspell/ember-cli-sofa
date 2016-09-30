import Ember from 'ember';
import { forwardCall } from './computed';

const {
  computed: { oneWay }
} = Ember;

let call = forwardCall('_internal');

let prop = (name) => {
  return oneWay(`_internal.${name}`).readOnly();
};

export default Ember.Object.extend({

  _internal: null,

  store:      prop('store'),
  identifier: prop('identifier'),
  documents:  prop('documents'),

  modelClassForName: call('modelClassForName'),
  model:             call('model'),
  push:              call('push'),

});
