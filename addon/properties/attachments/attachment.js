import Ember from 'ember';

const {
  computed
} = Ember;

const internal = (prop) => {
  return computed(function() {
    return this._internal[prop];
  }).readOnly();
};

export default Ember.ObjectProxy.extend({

  _internal: null,

  name: internal('name'),

  content: computed(function() {
    return this._internal.getAttachmentContentModel();
  }).readOnly()

});
