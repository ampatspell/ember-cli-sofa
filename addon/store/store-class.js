import Ember from 'ember';
import { object } from '../util/computed';
import { notBlank, isClass_ } from '../util/assert';

const {
  getOwner,
  String: { dasherize },
  set
} = Ember;

export default Ember.Mixin.create({

  _classes: object(),

  _normalizeModelName(modelName) {
    notBlank('model name', modelName);
    return dasherize(modelName);
  },

  _classForName(prefix, modelName, prepareFn) {
    let normalizedModelName = this._normalizeModelName(modelName);
    let fullName = `${prefix}:${normalizedModelName}`;
    let cache = this.get('_classes');
    let Class = cache[fullName];
    if(!Class) {
      Class = getOwner(this).lookup(fullName);
      isClass_(`class for name ${fullName} is not registered`, Class);
      if(prepareFn) {
        Class = prepareFn(Class, normalizedModelName);
      }
      set(Class, 'modelName', normalizedModelName);
      cache[fullName] = Class;
    }
    return Class;
  }

});
