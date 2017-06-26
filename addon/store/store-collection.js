import Ember from 'ember';
import create from '../util/create';

const {
  merge
} = Ember;

export default Ember.Mixin.create({

  _createCollectionForInternalCollection(_internal) {
    let collectionClass = _internal.collectionClass;
    return create(collectionClass, merge({ _internal }, _internal.opts));
  }

});
