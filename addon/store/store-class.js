import Ember from 'ember';
import { object } from '../util/computed';
import { assert, notBlank } from '../util/assert';

const {
  getOwner,
  setOwner,
  String: { dasherize },
  set,
  typeOf
} = Ember;

export default Ember.Mixin.create({

  _classes: object(),

  _normalizeModelName(modelName, prefix) {
    notBlank(`${prefix} name`, modelName);
    return dasherize(modelName);
  },

  _classForName(prefix, name, factory, variant, prepareBase, prepareVariant) {
    let normalizedModelName = this._normalizeModelName(name, prefix);
    let fullName = `${prefix}:${normalizedModelName}`;
    let cache = this.get('_classes');

    let keyPrefix = `${fullName}${factory ? `:${JSON.stringify(factory)}` : ''}`;
    let baseKey = `${keyPrefix}:-base`;
    let Base = cache[baseKey];
    if(!Base) {
      Base = getOwner(this).factoryFor(fullName);
      assert(`class for name ${fullName} is not registered`, !!Base);
      Base = Base.class;
      if(typeOf(Base) === 'function') {
        Base = Base(factory || {});
      }
      if(prepareBase) {
        Base = prepareBase(Base, normalizedModelName);
      }
      setOwner(Base, getOwner(this));
      set(Base, 'modelName', normalizedModelName);
      cache[baseKey] = Base;
    }

    if(variant) {
      let normalizedVariantName = this._normalizeModelName(variant, `${prefix} variant`);
      let variantKey = `${keyPrefix}:${normalizedVariantName}`;
      let Variant = cache[variantKey];
      if(!Variant) {
        if(prepareVariant) {
          Variant = prepareVariant(Base, normalizedVariantName);
        }
        set(Variant, 'modelVariant', normalizedVariantName);
        cache[variantKey] = Variant;
      }
      return Variant;
    }

    return Base;
  }

});
