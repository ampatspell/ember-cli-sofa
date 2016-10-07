import Ember from 'ember';

const {
  computed
} = Ember;

const internal = (prop) => {
  return computed(function() {
    return this._internal[prop];
  }).readOnly();
};

export default Ember.Object.extend({

  _internal: null,

  type:        internal('type'), // local, remote
  contentType: internal('contentType'),

});
