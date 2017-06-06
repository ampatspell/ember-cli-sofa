import Ember from 'ember';

const {
  computed
} = Ember;

const internal = (prop) => {
  return computed(function() {
    return this._internal[prop];
  }).readOnly();
};

const attachments = () => {
  return computed(function() {
    return this._internal.attachments.getAttachmentsModel();
  }).readOnly();
}

export default Ember.ObjectProxy.extend({

  _internal: null,
  attachments: attachments(),

  name: internal('name'),

  content: computed(function() {
    return this._internal.getAttachmentContentModel();
  }).readOnly()

});
