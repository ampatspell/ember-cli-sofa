import Ember from 'ember';
import { assert } from '../util/assert';
import SofaModel, { getDefinition } from '../model';

import {
  __sofa_type__,
  __sofa_model_type__
} from './store-constants';

export default Ember.Mixin.create({

  _isModelClass(Model) {
    if(Model.class) {
      Model = Model.class;
    }
    let curr = Model;
    while(curr) {
      if(curr === SofaModel) {
        return true;
      }
      curr = curr.superclass;
    }
    return false;
  },

  modelClassForName(modelName) {
    return this._classForName('model', modelName, null, (Model, normalizedModelName) => {
      assert(`model '${normalizedModelName}' must be sofa Model`, this._isModelClass(Model));
      let Extended = Model.extend();
      Extended.reopenClass({ store: this, [__sofa_type__]: __sofa_model_type__ });
      return Extended;
    });
  },

  _definitionForModelClass(modelClass) {
    return getDefinition(modelClass);
  }

});
