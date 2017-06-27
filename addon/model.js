import Ember from 'ember';
import Error from './util/error';
import { internalPropertyName, getInternalModel } from './internal-model';
import { create as definition } from './model-definition';
import { type, rev, id, attachments } from './properties/helpers';
import ModelStateMixin from './model-state-mixin';

const {
  computed,
  get,
  assert,
  RSVP: { reject },
  guidFor
} = Ember;

function getDefinitionForClass(modelClass) {
  return get(modelClass, 'definition');
}

export function getDefinition(modelClass) {
  assert('modelClass must be factory', !!modelClass.class);
  return getDefinitionForClass(modelClass.class);
}

const constructor = () => {
  return computed(function() {
    return get(this.constructor, 'modelName');
  }).readOnly();
};

const internal = name => {
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
  return function(type) {
    let definition = getDefinitionForClass(this.constructor);
    let internal = getInternalModel(this);
    return definition.serialize(internal, type);
  };
};

const databaseInternalPromise = functionName => {
  return function(...args) {
    let database = this.get('database');
    if(!database) {
      return reject(new Error({
        error: 'no_database',
        reason: `model ${this} doesn't have database assigned`
      }));
    }
    let fn = database[functionName];
    assert(`function ${functionName} not declared for database`, !!fn);
    let internal = getInternalModel(this);
    return fn.call(database, internal, ...args).then(() => {
      return this;
    });
  };
};

const docId = () => {
  return computed('id', function() {
    let modelId = this.get('id');
    let definition = getDefinitionForClass(this.constructor);
    return definition.docId(modelId);
  }).readOnly();
};

const encodedDocId = () => {
  return computed('docId', function() {
    let docId = this.get('docId');
    if(!docId) {
      return;
    }
    return encodeURIComponent(docId);
  }).readOnly();
};

const Model = Ember.Object.extend(ModelStateMixin, {

  [internalPropertyName]: null,

  type: type(),
  attachments: attachments(),
  rev: rev(),
  id: id(),

  docId: docId(),
  encodedDocId: encodedDocId(),
  modelName: constructor('modelName'),
  database: internal('database'),
  serialize: serialize(),

  save: databaseInternalPromise('_saveInternalModel'),
  load: databaseInternalPromise('_loadInternalModel'),
  reload: databaseInternalPromise('_reloadInternalModel'),
  delete: databaseInternalPromise('_deleteInternalModel'),

  willCreate() {},
  willSave()   {},
  willDelete() {},

  willDestroy() {
    getInternalModel(this).modelWillDestroy();
    this._super();
  },

  toString() {
    let id = this.get('id');
    return `<model@${this.get('modelName')}::${guidFor(this)}${id ? `:${id}` : ''}>`;
  }

});

Model.reopenClass({

  store: null,
  modelName: null,
  definition: definition(),

  _create() {
    throw new Error({
      error: 'internal',
      reason: 'model.create'
    });
  }

});

export default Model;
