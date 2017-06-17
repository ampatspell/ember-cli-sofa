import Ember from 'ember';
import { defaultFeedIdentifiers } from 'couch/couch/changes/changes';

const {
  Evented
} = Ember;

const call = name => {
  return function() {
    let internal = this._internal;
    return internal[name].call(internal, ...arguments);
  }
}

const Changes = Ember.Object.extend(Evented, {

  _internal: null,

  feed: defaultFeedIdentifiers,

  start:   call('start'),
  stop:    call('stop'),
  restart: call('restart'),

  willDestroy() {
    this._internal.changesWillDestroy();
    this._super();
  }

});

Changes.reopenClass({

  _create: Changes.create

});

export default Changes;
