import Ember from 'ember';
import { getInternalModel } from '../internal-model';
// import { onDirty } from '../state';

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

  prepareModelClass(name, declaringModelClass) {
    this.validatePropertyName(name);
    this.name = name;
    this.opts.key = this.opts.key || this.name;
    this.declaringModelClass = declaringModelClass;
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
    let store = get(this.declaringModelClass, 'store');
    return store._transformForName(this.opts.transform);
  }

  transformValueToInternalModel(internal, value) {
    let transform = this.transform(internal);
    return transform.toModel(value, this);
  }

  //

  // dirty(model) {
  //   if(!this.opts.dirties) {
  //     return;
  //   }
  //   onDirty(model);
  // }

  //

  // getDataValue(model) {
  //   return model.get('internal').getValue(this.name);
  // }

  // setDataValue(model, value) {
  //   return model.get('internal').setValue(this.name, value);
  // }

  //

  // _getValue(model) {
  //   return this.getDataValue(model);
  // }

  getValue(internal) {
    return internal.getValue(this.name);
  }

  _setValue(internal, value, changed) {
    internal.setValue(this.name, value, changed);
    // let result = this.setDataValue(model, value);
    // this.dirty(model);
    // this.notifyDocumentChange(model);
    // return result;
  }

  setValue(internal, value, changed) {
    return this._setValue(internal, value, changed);
  }

  // //

  getPropertyValue(model) {
    let internal = getInternalModel(model);
    return this.getValue(internal);
  }

  // setPropertyValue(model, value) {
  //   let transformed = this.transformValueToModel(model, value);
  //   let current = this.getDataValue(model);
  //   if(current !== transformed) {
  //     return this.setValue(model, transformed);
  //   }
  //   return transformed;
  // }

  // notifyDocumentChange(model, self=false) {
  //   model.notifyPropertyChange('document');
  //   if(!self) {
  //     get(model.constructor, 'definition').documentDidChange(this, model, this.name);
  //   }
  // }

  // documentDidChange() {
  // }

  // notifyPropertyChange(model) {
  //   model.notifyPropertyChange(this.name);
  //   this.notifyDocumentChange(model);
  // }

  // //

  // setDocValue(doc, value) {
  //   if(value !== undefined) {
  //     doc[this.opts.key] = value;
  //   }
  // }

  // getDocValue(doc) {
  //   return doc[this.opts.key];
  // }

  // _serialize(model, doc) {
  //   let value = this.getDataValue(model);
  //   this.setDocValue(doc, value);
  // }

  // serialize(model, doc) {
  //   if(!this.opts.serialize) {
  //     return;
  //   }
  //   return this._serialize(model, doc);
  // }

  // _deserialize(model, doc) {
  //   let value = this.getDocValue(doc);
  //   model.set(this.name, value);
  // }

  // deserialize(model, doc) {
  //   if(!this.opts.deserialize) {
  //     return;
  //   }
  //   return this._deserialize(model, doc);
  // }

}
