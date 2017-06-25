import Ember from 'ember';
import SofaQuery from '../query';
import { assert } from '../util/assert';

import {
  __sofa_type__,
  __sofa_query_type__
} from './store-constants';

export default Ember.Mixin.create({

  _isQueryClass(Query) {
    if(Query.class) {
      Query = Query.class;
    }
    let curr = Query;
    while(curr) {
      if(curr === SofaQuery) {
        return true;
      }
      curr = curr.superclass;
    }
    return false;
  },

  _queryClassForName({ name, factory, variant }) {
    Ember.assert(`query variant name is required`, variant && variant.name);
    return this._classForName({
      prefix: 'query',
      name,
      factory,
      prepare: (Query, normalizedModelName) => {
        assert(`query '${normalizedModelName}' must be sofa Query`, this._isQueryClass(Query));
        let Extended = Query.extend();
        Extended.reopenClass({ store: this, [__sofa_type__]: __sofa_query_type__ });
        return Extended;
      },
      variant
    });
  }

});
