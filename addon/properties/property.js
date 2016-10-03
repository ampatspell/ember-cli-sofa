import Ember from 'ember';
import { getInternalModel } from '../internal-model';

const {
  merge,
  assert,
  get
} = Ember;

function expandPersist(opts) {
  opts = opts || {};
  let persist = opts.persist;
  delete opts.persist;
  if(persist === false) {
    opts.serialize = false;
    opts.deserialize = false;
  }
  return opts;
}

export default class Property {

  constructor(opts) {
    opts = expandPersist(opts);
    this.opts = merge({ dirties: true, serialize: true, deserialize: true, transform: null, fallback: null }, opts);
    if(!this.opts.serialize) {
      this.opts.dirties = false;
    }
  }

  get setsModelInitialValueFromOptions() {
    return true;
  }

  validatePropertyName(name) {
    let required = this.requiredPropertyName;
    if(required) {
      assert(`${this.constructor.name} can be used only for ${required} properties`, required === name);
    }
  }

  prepareModelClass(name, declaringModelClass, store) {
    this.validatePropertyName(name);
    this.name = name;
    this.opts.key = this.opts.key || this.name;
    this.declaringModelClass = declaringModelClass;
    this.store = store;
  }

  prepareInternalModel(internal, opts, changed) {
    if(!this.setsModelInitialValueFromOptions) {
      return;
    }
    let name = this.name;
    let value = opts[name];
    let transformed = this.transformValueToInternalModel(internal, value);
    this.setValue(internal, transformed, changed);
    return name;
  }

  //

  transform() {
    return this.store._transformForName(this.opts.transform);
  }

  transformValueToInternalModel(internal, value) {
    let transform = this.transform(internal);
    return transform.toModel(value, this);
  }

  //

  dirty(internal, changed) {
    if(!this.opts.dirties) {
      return;
    }
    internal.onDirty(changed);
  }

  notifyPropertyChange(internal) {
    internal.notifyPropertyChange(this.name);
  }

  //

  getInternalValue(internal) {
    return internal.getValue(this.name);
  }

  setInternalValue(internal, value, changed) {
    internal.setValue(this.name, value, changed);
  }

  //

  _getValue(internal) {
    return this.getInternalValue(internal);
  }

  getValue(internal) {
    return this._getValue(internal);
  }

  _setValue(internal, value, changed) {
    this.setInternalValue(internal, value, changed);
    this.dirty(internal, changed);
    return value;
  }

  setValue(internal, value, changed) {
    let transformed = this.transformValueToInternalModel(internal, value);
    let current = this.getInternalValue(internal);
    if(current !== transformed) {
      return this._setValue(internal, transformed, changed);
    }
    return current;
  }

  //

  getPropertyValue(model) {
    let internal = getInternalModel(model);
    return this.getValue(internal);
  }

  setPropertyValue(model, value) {
    let internal = getInternalModel(model);
    return this.setValue(internal, value, internal.boundNotifyPropertyChange);
  }

  //

  setDocValue(doc, value) {
    if(value !== undefined) {
      doc[this.opts.key] = value;
    }
  }

  getDocValue(doc) {
    return doc[this.opts.key];
  }

  _serialize(internal, doc) {
    let value = this.getInternalValue(internal);
    this.setDocValue(doc, value);
  }

  serialize(internal, doc) {
    if(!this.opts.serialize) {
      return;
    }
    return this._serialize(internal, doc);
  }

  _deserialize(internal, doc, changed) {
    let value = this.getDocValue(doc);
    this.setValue(internal, value, changed);
    return this.opts.key;
  }

  deserialize(internal, doc, changed) {
    if(!this.opts.deserialize) {
      return;
    }
    return this._deserialize(internal, doc, changed);
  }

}
