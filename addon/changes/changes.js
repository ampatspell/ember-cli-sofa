import Ember from 'ember';
import { defaultFeedIdentifiers } from 'couch/couch/changes/changes';

const {
  Evented,
  computed
} = Ember;

const call = name => {
  return function() {
    let internal = this._internal;
    return internal[name].call(internal, ...arguments);
  }
}

const internalProperty = key => {
  return computed(function() {
    return this._internal.state[key];
  }).readOnly();
}

const listener = () => {
  return computed(function() {
    return this._internal.getListener(false);
  }).readOnly();
}

const listenerProperty = key => {
  let dep = `_listener.${key}`;
  return computed(dep, function() {
    return this.get(dep);
  }).readOnly();
}

const state = () => {
  let keys = [ 'isStarted', 'isSuspended', 'isError', 'error' ];
  return computed(...keys, function() {
    return this.getProperties(keys);
  }).readOnly();
}

export default Ember.Object.extend(Evented, {

  _internal: null,
  _listener: listener(),

  feed: defaultFeedIdentifiers,

  isStarted:   listenerProperty('isStarted'),
  isSuspended: listenerProperty('isSuspended'),
  isError:     internalProperty('isError'),
  error:       internalProperty('error'),
  state:       state(),

  start:   call('start'),
  stop:    call('stop'),
  restart: call('restart'),
  suspend: call('suspend'),

  willDestroy() {
    this._internal.changesWillDestroy();
    this._super();
  }

});
