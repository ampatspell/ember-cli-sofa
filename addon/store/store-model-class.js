import Ember from 'ember';
import { assert } from '../util/assert';
import SofaModel from '../model';

const __sofa_type__ = '__sofa_type__';
const __sofa_model_type__ = 'model';

export default Ember.Mixin.create({

  _isModelClass(Model) {
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
    return this._classForName('model', modelName, (Model, normalizedModelName) => {
      assert(`model '${normalizedModelName}' must be sofa Model`, this._isModelClass(Model));
      let store = this.store;
      let Extended = Model.extend();
      Extended.reopenClass({ store, [__sofa_type__]: __sofa_model_type__ });
      return Extended;
    });
  }

});
