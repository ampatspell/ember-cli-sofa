import Ember from 'ember';
import create from '../util/create';

const {
  merge
} = Ember;

export default Ember.Mixin.create({

  _createCollectionForInternalCollection(internal) {
    let collectionClass = internal.collectionClass;
    return create(collectionClass, merge({ _internal: internal, content: internal.content }, internal.opts));
  }

});
