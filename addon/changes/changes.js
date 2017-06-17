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

const state = () => {
  return computed(function() {
    return this._internal.getState();
  }).readOnly();
}

const stateProperty = key => {
  return computed('state', function() {
    return this.get('state')[key];
  }).readOnly();
}

const Changes = Ember.Object.extend(Evented, {

  _internal: null,

  feed: defaultFeedIdentifiers,

  state:       state(),
  isStarted:   stateProperty('isStarted'),
  isSuspended: stateProperty('isSuspended'),
  isError:     stateProperty('isError'),
  error:       stateProperty('error'),

  start:   call('start'),
  stop:    call('stop'),
  restart: call('restart'),
  suspend: call('suspend'),

  willDestroy() {
    this._internal.changesWillDestroy();
    this._super();
  }

});

Changes.reopenClass({

  _create: Changes.create

});

export default Changes;
