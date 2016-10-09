import Ember from 'ember';
import { Content } from './content';

const {
  computed
} = Ember;

const file = (key) => {
  return computed(function() {
    return this._internal.file[key];
  }).readOnly();
};

const state = () => {
  return computed(function() {
    return this._internal.getState();
  }).readOnly();
};

const stateProperty = (name) => {
  return computed('state', function() {
    return this.get('state')[name];
  }).readOnly();
};

const call = (key) => {
  return computed(function() {
    let internal = this._internal;
    return internal[key].call(internal, ...arguments);
  }).readOnly();
};

let hash = {

  state:       state(),

  contentType: file('contentType'),
  length:      file('size'),

  url:         call('getURL'),

  promise:     call('getURLPromise'),
  base64:      call('getBase64Promise'),

};

['isLoading', 'isLoaded', 'isError', 'error'].forEach(prop => {
  hash[prop] = stateProperty(prop);
});

export default Content.extend(hash);
