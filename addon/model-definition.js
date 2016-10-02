import Ember from 'ember';
import EmptyObject from './util/empty-object';
import { isClass_ } from './util/assert';

const {
  computed,
  copy,
  get
} = Ember;

export function create() {
  return computed(function() {
    return new Definition(this);
  }).readOnly();
}

const sofaKey = '__sofa';

function lookupProperties(modelClass) {
  let all = Ember.A();
  let byName = new EmptyObject();

  modelClass.eachComputedProperty((name, meta) => {
    if(!meta || meta[sofaKey] !== true) {
      return;
    }

    let property = meta.property;
    property.prepareModelClass(name, modelClass);

    all.push(property);
    byName[name] = property;
  });

  all.reverse();

  return { all, byName };
}

export default class Definition {

  constructor(modelClass) {
    this.modelClass = modelClass;
    this.properties = lookupProperties(modelClass);
  }

  get modelName() {
    let modelName = this._modelName;
    if(!modelName) {
      modelName = get(this.modelClass, 'modelName');
      this._modelName = modelName;
    }
    return modelName;
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

  serialize(internal, preview=false) {
    let doc = copy(internal.raw || {});
    this.eachProperty(property => {
      property.serialize(internal, doc, preview);
    });
    return doc;
  }

  deserialize(internal, doc, changed) {
    let raw = copy(doc);
    this.eachProperty(property => {
      let key = property.deserialize(internal, doc, changed);
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

  deserializeSaveOrUpdate(internal, json, changed) {
    this.deserializeProperty(internal, 'id', json.id, changed);
    this.deserializeProperty(internal, 'rev', json.rev, changed);
  }

  deserializeDelete(internal, json, changed) {
    if(!json) {
      return;
    }
    this.deserializeProperty(internal, 'id', json.id, changed);
    this.deserializeProperty(internal, 'rev', null, changed);
  }

  docId(modelId) {
    return this.property('id').docId(this.modelClass, modelId);
  }

  modelId(docId) {
    return this.property('id').modelId(this.modelClass, docId);
  }

  is(parent) {
    isClass_(`parent must be class not ${parent}`, parent);
    let arg = parent.superclass.superclass;
    let self = this.modelClass.superclass.superclass;
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

}
