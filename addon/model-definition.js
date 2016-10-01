import Ember from 'ember';
import EmptyObject from './util/empty-object';
import { isClass_ } from './util/assert';

const {
  computed,
  copy
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
    let doc = {};
    this.eachProperty(property => {
      property.serialize(internal, doc, preview);
    });
    return doc;
  }

  // deserialize(model, doc) {
  //   this.eachProperty(property => {
  //     property.deserialize(model, doc);
  //   });
  // }

  // deserializeIdRev(model, json) {
  //   let id = this.modelId(json.id);
  //   let rev = json.rev;
  //   model.setProperties({ id, rev });
  // }

  // deserializeSaveOrUpdate(model, json) {
  //   this.deserializeIdRev(model, json);
  // }

  // deserializeDelete(model, json) {
  //   if(!json) {
  //     return;
  //   }
  //   this.deserializeIdRev(model, json);
  // }

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
