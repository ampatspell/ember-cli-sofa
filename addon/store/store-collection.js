import Ember from 'ember';

const {
  merge
} = Ember;

export default Ember.Mixin.create({

  _createCollectionForInternalCollection(internal) {
    let Collection = internal.collectionClass;
    return Collection.create(merge({ _internal: internal, content: internal.content }, internal.opts));
  }

});
