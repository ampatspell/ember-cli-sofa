import Ember from 'ember';
import SofaChanges from '../changes/changes';
import { assert } from '../util/assert';

import {
  __sofa_type__,
  __sofa_changes_type__
} from './store-constants';

export default Ember.Mixin.create({

  _isChangesClass(Changes) {
    let curr = Changes;
    while(curr) {
      if(curr === SofaChanges) {
        return true;
      }
      curr = curr.superclass;
    }
    return false;
  },

  _changesClassForName(changesName) {
    return this._classForName('sofa/changes', changesName, null, (Changes, normalizedModelName) => {
      assert(`changes '${normalizedModelName}' must be sofa Changes`, this._isChangesClass(Changes));
      let Extended = Changes.extend();
      Extended.reopenClass({ store: this, [__sofa_type__]: __sofa_changes_type__ });
      return Extended;
    });
  }

});
