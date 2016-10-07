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

const state = (key) => {
  return computed(function() {
    return this._internal.state[key];
  }).readOnly();
};

const call = (key) => {
  return computed(function() {
    let internal = this._internal;
    return internal[key].call(internal, ...arguments);
  }).readOnly();
};

let hash = {

  contentType: file('contentType'),
  length:      file('size'),

  url:         call('getURL'),
  promise:     call('getPromise'),

  arrayBuffer: call('getArrayBufferPromise'),
  base64:      call('getBase64Promise'),

};

['isLoading', 'isLoaded', 'isError', 'progress', 'error'].forEach(prop => {
  hash[prop] = state(prop);
});

export default Content.extend(hash);
