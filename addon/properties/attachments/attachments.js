import Ember from 'ember';
// TODO: crappy import
import transform from '../relations/proxies/util/array-transform-mixin';

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

export default Ember.ArrayProxy.extend(Transform, {

  _internal: null,

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
