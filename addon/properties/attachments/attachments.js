import Ember from 'ember';
import transform from '../relations/proxies/util/array-transform-mixin';

const {
  get
} = Ember;

let Transform = transform({
  public(internal) {
    if(!internal) {
      return;
    }
    return internal.getAttachmentModel();
  },
  internal(hash) {
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

  unknownProperty(key) {
    return this.named(key);
  }

});
