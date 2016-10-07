import Ember from 'ember';

const {
  computed
} = Ember;

export const internal = (prop) => {
  return computed(function() {
    return this._internal[prop];
  }).readOnly();
};

export const Content = Ember.Object.extend({

  _internal: null,

  type: internal('type'), // local, remote

});
