import Ember from 'ember';
import transform from '../../util/array-transform-mixin';

const {
  computed
} = Ember;

let Transform = transform({
  public(internal) {
    if(!internal) {
      return;
    }
    return internal.getAttachmentModel();
  },
  internal(hash) {
    // TODO: maybe prevent to add/remove and ask using add(), remove()?
    return this._internal.createAttachmentInternalFromHash(hash);
  }
});

const model = () => {
  return computed(function() {
    return this._internal.internalModel.getModel();
  }).readOnly();
}

export default Ember.ArrayProxy.extend(Transform, {

  _internal: null,
  model: model(),

  named(name) {
    let internal = this._internal.getAttachmentInternalByName(name);
    if(!internal) {
      return;
    }
    return internal.getAttachmentModel();
  },

  add() {
    return this._internal.addAttachmentWithVariableArguments(...arguments);
  },

  remove(name) {
    return this._internal.removeAttachmentWithName(name);
  },

  unknownProperty(key) {
    return this.named(key);
  }

});
