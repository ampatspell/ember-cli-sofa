import Ember from 'ember';

const {
  computed
} = Ember;

export default Ember.ObjectProxy.extend({

  _internal: null,

  content: computed(function() {
    return this._internal.getAttachmentContentModel();
  }).readOnly()

});
