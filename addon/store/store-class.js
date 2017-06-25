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

  _classFactoryIdentifier(factory) {
    return JSON.stringify(factory);
  },

  _normalizeModelName(modelName, prefix) {
    notBlank(`${prefix} name`, modelName);
    return dasherize(modelName);
  },

  // { prefix, name, factory, prepare, variant: { name, prepare }}
  _classForName({ prefix, name, factory, prepare, variant }) {
    let normalizedModelName = this._normalizeModelName(name, prefix);
    let fullName = `${prefix}:${normalizedModelName}`;
    let cache = this.get('_classes');

    let factoryIdentifier = this._classFactoryIdentifier(factory);
    let keyPrefix = `${fullName}${factory ? `:${factoryIdentifier}` : ''}`;
    let baseKey = `${keyPrefix}:-base`;
    let Base = cache[baseKey];
    if(!Base) {
      Base = getOwner(this).factoryFor(fullName);
      assert(`class for name ${fullName} is not registered`, !!Base);
      Base = Base.class;
      if(typeOf(Base) === 'function') {
        Base = Base(factory || {});
      }
      if(prepare) {
        Base = prepare(Base, normalizedModelName);
      }
      setOwner(Base, getOwner(this));
      set(Base, 'modelName', normalizedModelName);
      cache[baseKey] = Base;
    }

    if(variant && variant.name) {
      let normalizedVariantName = this._normalizeModelName(variant.name, `${prefix} ${name} variant`);
      let variantKey = `${keyPrefix}:${normalizedVariantName}`;
      let Variant = cache[variantKey];
      if(!Variant) {
        if(variant.prepare) {
          Variant = variant.prepare(Base, normalizedVariantName);
        }
        set(Variant, 'modelVariant', normalizedVariantName);
        cache[variantKey] = Variant;
      }
      return Variant;
    }

    return Base;
  }

});
