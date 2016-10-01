import Ember from 'ember';
import Error from './util/error';
import { internalPropertyName, getInternalModel } from './internal-model';
import ModelStateMixin from './model-state-mixin';

const {
  computed,
  get
} = Ember;

const constructor = () => {
  return computed(function() {
    return get(this.constructor, 'modelName');
  }).readOnly();
};

// const internalProperty = (name) => {
//   return computed(function() {
//     return getInternalModel(this)[name];
//   }).readOnly();
// };

const database = () => {
  return computed({
    get() {
      return getInternalModel(this).database;
    },
    set(key, value) {
      let internal = getInternalModel(this);
      if(internal.database !== value) {
        if(!internal.isNew) {
          throw new Error({
            error: 'internal',
            reason: 'Database can be set only while model is new'
          });
        }
        internal.database = value;
      }
      return value;
    }
  });
};

const Model = Ember.Object.extend(ModelStateMixin, {

  [internalPropertyName]: null,

  modelName: constructor('modelName'),
  database: database(),

});

Model.reopenClass({

  store: null,
  modelName: null,

  _create: Model.create,

  create() {
    throw new Error({
      error: 'internal',
      reason: 'model.create'
    });
  },

});

export default Model;
