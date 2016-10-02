import Ember from 'ember';
import Error from './util/error';
import { internalPropertyName, getInternalModel } from './internal-model';
import { create as definition } from './model-definition';
import { type, rev, id } from './properties/helpers';
import ModelStateMixin from './model-state-mixin';

const {
  computed,
  get
} = Ember;

export function getDefinition(modelClass) {
  return get(modelClass, 'definition');
}

const constructor = () => {
  return computed(function() {
    return get(this.constructor, 'modelName');
  }).readOnly();
};

const internal = (name) => {
  return computed({
    get() {
      return getInternalModel(this)[name];
    },
    set(key, value) {
      getInternalModel(this)[name] = value;
      return value;
    }
  });
};

const serialize = () => {
  return function(preview=false) {
    let definition = getDefinition(this.constructor);
    let internal = getInternalModel(this);
    return definition.serialize(internal, preview);
  };
};

const docId = () => {
  return computed('id', function() {
    let modelId = this.get('id');
    let definition = getDefinition(this.constructor);
    return definition.docId(modelId);
  }).readOnly();
};

const Model = Ember.Object.extend(ModelStateMixin, {

  [internalPropertyName]: null,

  type: type(),
  rev: rev(),
  id: id(),

  docId: docId(),

  modelName: constructor('modelName'),
  database: internal('database'),

  serialize: serialize(),

});

Model.reopenClass({

  store: null,
  modelName: null,
  definition: definition(),

  _create: Model.create,

  create() {
    throw new Error({
      error: 'internal',
      reason: 'use `store.model` or `database.model` to create new models'
    });
  },

});

export default Model;
