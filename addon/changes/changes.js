import Ember from 'ember';
import Error from '../util/error';
import { defaultFeedIdentifier } from 'couch/couch/changes/changes';

const {
  Evented,
  get,
  guidFor
} = Ember;

const call = name => {
  return function() {
    let internal = this._internal;
    return internal[name].call(internal, ...arguments);
  }
}

const Changes = Ember.Object.extend(Evented, {

  _internal: null,

  feed: defaultFeedIdentifier,
  view: null,

  toString() {
    return `<changes@:${get(this.constructor, 'modelName')}::${guidFor(this)}>`;
  },

  start:   call('start'),
  stop:    call('stop'),
  restart: call('restart'),

  willDestroy() {
    this._internal.changesWillDestroy();
    this._super();
  }

});

Changes.reopenClass({

  _create: Changes.create,

  create() {
    throw new Error({
      error: 'internal',
      reason: 'use `database.changes` to create new changes instances'
    });
  }

});

export default Changes;
