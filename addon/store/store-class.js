import Ember from 'ember';
import { object } from '../util/computed';
import { assert, notBlank } from '../util/assert';
import { lookupStoreIdentifier } from '../store-identifier';

const {
  getOwner,
  setOwner,
  String: { dasherize },
  set,
  typeOf
} = Ember;

export default Ember.Mixin.create({

  _identifier: null,
  _classes: object(),

  init() {
    this._super(...arguments);
    this.set('_identifier', lookupStoreIdentifier(this));
  },

  _classFactoryIdentifier(factory) {
    if(!factory) {
      return;
    }
    let key = JSON.stringify(factory);
    return key.replace(/"/g, '').replace(/:/g, '=');
  },

  _normalizeModelName(modelName, prefix) {
    notBlank(`${prefix} name`, modelName);
    return dasherize(modelName);
  },

  _lookupClassFactory(name) {
    let classes = this.get('_classes');
    let Factory = classes[name];
    if(!Factory) {
      let owner = getOwner(this);
      Factory = owner.factoryFor(name);
      classes[name] = Factory;
    }
    return Factory;
  },

  _registerClassFactory(name, Class) {
    let owner = getOwner(this);
    owner.register(name, Class);
    let Factory = owner.factoryFor(name);
    let classes = this.get('_classes');
    classes[name] = Factory;
    return Factory;
  },

  _storeClassFactoryPrefix() {
    let prefix = 'sofa';
    let identifier = this.get('_identifier');
    if(identifier) {
      prefix = `${prefix}/${identifier}`;
    }
    return prefix;
  },

  // { prefix, name, factory, prepare, variant: { name, prepare }}
  _classForName({ prefix, name, factory, prepare, variant }) {
    let normalizedModelName = this._normalizeModelName(name, prefix);
    let fullName = `${prefix}:${normalizedModelName}`;

    let storePrefix = this._storeClassFactoryPrefix();
    let factoryIdentifier = this._classFactoryIdentifier(factory);

    let baseFactoryName = `${storePrefix}:${prefix}/${normalizedModelName}${factoryIdentifier ? `/${factoryIdentifier}` : ''}`;

    let normalizedVariantName;
    let variantFactoryName;
    if(variant && variant.name) {
      normalizedVariantName = this._normalizeModelName(variant.name, `${prefix} ${name} variant`);
      variantFactoryName = `${baseFactoryName}/${normalizedVariantName}`;
    }

    let Base = this._lookupClassFactory(baseFactoryName);
    if(!Base) {
      Base = this._lookupClassFactory(fullName);
      assert(`class for name ${fullName} is not registered`, !!Base);
      Base = Base.class;
      if(typeOf(Base) === 'function') {
        Base = Base(factory || {});
      }
      if(prepare) {
        Base = prepare(Base, normalizedModelName);
      }
      set(Base, 'modelName', normalizedModelName);
      Base = this._registerClassFactory(baseFactoryName, Base);
    }

    if(variant && variant.name) {
      let Variant = this._lookupClassFactory(variantFactoryName);
      if(!Variant) {
        Variant = Base.class;
        if(variant.prepare) {
          Variant = variant.prepare(Variant, normalizedVariantName);
        } else {
          Variant = Variant.extend();
        }
        set(Variant, 'modelVariant', normalizedVariantName);
        Variant = this._registerClassFactory(variantFactoryName, Variant);
      }
      return Variant;
    }

    return Base;
  }

});
