import Ember from 'ember';

const {
  computed,
  computed: { equal }
} = Ember;

export const internal = (prop) => {
  return computed(function() {
    return this._internal[prop];
  }).readOnly();
};

export const Content = Ember.Object.extend({

  _internal: null,

  type: internal('type'), // local, remote

  isLocal:  equal('type', 'local').readOnly(),
  isRemote: equal('type', 'remote').readOnly(),

});
