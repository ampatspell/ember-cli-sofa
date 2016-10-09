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

  _normalizeModelName(modelName, prefix, optional=false) {
    if(!optional) {
      notBlank(`${prefix} name`, modelName);
    }
    return dasherize(modelName);
  },

  _classForName(prefix, modelName, variantName, prepareBaseFn, prepareVariantFn) {
    let normalizedModelName = this._normalizeModelName(modelName, prefix);
    let fullName = `${prefix}:${normalizedModelName}`;
    let cache = this.get('_classes');

    let baseKey = `${fullName}:-base`;
    let Base = cache[baseKey];
    if(!Base) {
      Base = getOwner(this).lookup(fullName);
      isClass_(`class for name ${fullName} is not registered`, Base);
      if(prepareBaseFn) {
        Base = prepareBaseFn(Base, normalizedModelName);
      }
      set(Base, 'modelName', normalizedModelName);
      cache[baseKey] = Base;
    }

    if(variantName) {
      let normalizedVariantName = this._normalizeModelName(variantName, `${prefix} variant`);
      let variantKey = `${fullName}:${normalizedVariantName}`;
      let Variant = cache[variantKey];
      if(!Variant) {
        if(prepareVariantFn) {
          Variant = prepareVariantFn(Base, normalizedVariantName);
        }
        set(Variant, 'modelVariant', normalizedVariantName);
        cache[variantKey] = Variant;
      }
      return Variant;
    }

    return Base;
  }

});
