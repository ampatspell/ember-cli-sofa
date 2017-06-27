import Ember from 'ember';
import EmptyObject from './util/empty-object';
import { assert, isClass_, isOneOf } from './util/assert';

const {
  computed,
  copy,
  get,
  A
} = Ember;

export function create() {
  return computed(function() {
    let store = get(this, 'store');
    let factory = store._classFactoryForClass(this);
    return new Definition(factory);
  }).readOnly();
}

const sofaKey = '__sofa';

function lookupProperty(meta, store) {
  let property = meta.property;
  if(!property) {
    property = meta.build(store);
    delete meta.build;
    meta.property = property;
  }
  return property;
}

function lookupProperties(modelClassFactory) {
  let all = A();
  let byName = new EmptyObject();
  let modelClass = modelClassFactory.class;

  let store = get(modelClass, 'store');
  modelClass.eachComputedProperty((name, meta) => {
    if(!meta || meta[sofaKey] !== true ) {
      return;
    }

    let property = lookupProperty(meta, store);
    property.prepareModelClass(name, modelClass, store);

    all.push(property);
    byName[name] = property;
  });

  all.reverse();

  return { all, byName };
}

export default class Definition {

  constructor(modelClass) {
    Ember.assert('modelClass must be factory', !!modelClass.class);
    this.modelClass = modelClass;
    this.properties = lookupProperties(modelClass);
  }

  get modelName() {
    let modelName = this._modelName;
    if(!modelName) {
      modelName = get(this.modelClass.class, 'modelName');
      this._modelName = modelName;
    }
    return modelName;
  }

  get type() {
    let property = this.property('type');
    return property.getDocumentKeyValue(this.modelClass);
  }

  eachProperty(fn) {
    this.properties.all.forEach(fn);
  }

  prepareInternalModel(internalModel, opts) {
    opts = copy(opts || {});
    internalModel.withPropertyChanges(changed => {
      this.eachProperty(property => {
        let key = property.prepareInternalModel(internalModel, opts, changed);
        if(key) {
          delete opts[key];
        }
      });
    }, false);
    return opts;
  }

  property(name) {
    return this.properties.byName[name];
  }

  matchesDocument(doc) {
    return this.property('type').matchesDocument(this.modelClass, doc);
  }

  willSerialize(internal, type='document') {
    this.eachProperty(property => {
      property.willSerialize(internal, type);
    });
  }

  serialize(internal, type='document') {
    isOneOf('type', type, [ 'preview', 'document', 'shoebox' ]);
    let doc = copy(internal.raw || {});
    this.eachProperty(property => {
      property.serialize(internal, doc, type);
    });
    return doc;
  }

  deserialize(internal, doc, changed, type=null) {
    let raw = copy(doc);
    this.eachProperty(property => {
      let key = property.deserialize(internal, doc, changed, type);
      if(key) {
        delete raw[key];
      }
    });
    internal.raw = raw;
  }

  deserializeProperty(internal, name, value, changed) {
    let property = this.property(name);
    let key = property.opts.key;
    let doc = { [key]: value };
    property.deserialize(internal, doc, changed);
  }

  deserializeSaveUpdateOrDelete(internal, json, changed) {
    this.deserializeProperty(internal, 'id', json.id, changed);
    this.deserializeProperty(internal, 'rev', json.rev, changed);
  }

  deserializeSaveOrUpdate(internal, json, changed) {
    this.deserializeSaveUpdateOrDelete(internal, json, changed);
  }

  deserializeDelete(internal, json, changed) {
    if(!json) {
      return;
    }
    this.deserializeSaveUpdateOrDelete(internal, json, changed);
  }

  deserializeAttachments(internal, doc, changed) {
    this.property('attachments').deserialize(internal, doc, changed);
  }

  docId(modelId) {
    return this.property('id').docId(this.modelClass, modelId);
  }

  modelId(docId) {
    return this.property('id').modelId(this.modelClass, docId);
  }

  is(parent) {
    assert('parent', !!parent);
    isClass_(`parent must be factory`, parent.class);
    let arg = parent.class.superclass;
    let self = this.modelClass.class.superclass;
    while(self) {
      if(arg === self) {
        return true;
      }
      self = self.superclass;
      if(self === Ember.Object) {
        return false;
      }
    }
    return false;
  }

  onLoaded(internal, doc, changed, type=null) {
    this.deserialize(internal, doc, changed, type);
    internal.onLoaded(changed);
  }

  onSaved(internal, json, changed) {
    this.deserializeSaveOrUpdate(internal, json, changed);
    internal.onSaved(changed);
  }

  onDeleted(internal, json, changed) {
    this.deserializeDelete(internal, json, changed);
    internal.onDeleted(changed);
  }

}
