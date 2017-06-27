import Ember from 'ember';

const {
  merge
} = Ember;

export default Ember.Mixin.create({

  _createCollectionForInternalCollection(_internal) {
    let Collection = _internal.collectionClass;
    return Collection.create(merge({ _internal }, _internal.opts));
  }

});
