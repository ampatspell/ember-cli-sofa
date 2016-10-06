import Ember from 'ember';
import SofaQuery from '../query';
import { assert } from '../util/assert';

import {
  __sofa_type__,
  __sofa_query_type__
} from './store-constants';

export default Ember.Mixin.create({

  _isQueryClass(Query) {
    let curr = Query;
    while(curr) {
      if(curr === SofaQuery) {
        return true;
      }
      curr = curr.superclass;
    }
    return false;
  },

  _queryClassForName(queryName, variantName, variantFn) {
    Ember.assert(`query variant name is required`, !!variantName);
    return this._classForName('query', queryName, variantName, (Query, normalizedModelName) => {
      assert(`query '${normalizedModelName}' must be sofa Query`, this._isQueryClass(Query));
      let Extended = Query.extend();
      Extended.reopenClass({ store: this, [__sofa_type__]: __sofa_query_type__ });
      return Extended;
    }, variantFn);
  }

});
