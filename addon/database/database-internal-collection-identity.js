import Ember from 'ember';

const {
  get
} = Ember;

export default Ember.Mixin.create({

  _serializeCollectionOpts(opts) {
    return JSON.stringify(opts);
  },

  _collectionIdentifier(collectionClass, opts) {
    if(!opts) {
      opts = null;
    }
    let modelName = get(collectionClass, 'modelName');
    let serializedOpts = this._serializeCollectionOpts(opts);
    return `${modelName} - ${serializedOpts}`;
  },

});
