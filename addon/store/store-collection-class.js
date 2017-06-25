import Ember from 'ember';
import SofaCollection from '../collection/collection';
import { assert } from '../util/assert';

import {
  __sofa_type__,
  __sofa_collection_type__
} from './store-constants';

export default Ember.Mixin.create({

  _isCollectionClass(Collection) {
    let curr = Collection;
    while(curr) {
      if(curr === SofaCollection) {
        return true;
      }
      curr = curr.superclass;
    }
    return false;
  },

  _collectionClassForName(queryName) {
    return this._classForName({
      prefix: 'collection',
      name: queryName,
      prepare: (Collection, normalizedModelName) => {
        assert(`collection '${normalizedModelName}' must be sofa Collection`, this._isCollectionClass(Collection));
        let Extended = Collection.extend();
        Extended.reopenClass({ store: this, [__sofa_type__]: __sofa_collection_type__ });
        return Extended;
      }
    });
  }

});
