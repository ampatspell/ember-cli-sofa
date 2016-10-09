import Ember from 'ember';

const {
  merge
} = Ember;

export default Ember.Mixin.create({

  _internalArrayToModelsArray(array) {
    // TODO: ArrayProxy which lazy-creates models
    return Ember.A(array.map(internal => {
      return internal.getModel();
    }));
  },

  _internalToModel(internal) {
    if(internal) {
      return internal.getModel();
    }
  },

  _createModelForName(modelName, props) {
    let store = this.get('store');
    let Model = this.modelClassForName(modelName);
    let { internal, instance } = store._createNewInternalModel(Model, this, props);
    this._storeNewInternalModel(internal);
    return internal.getModel(instance);
  },

  model(modelName, props) {
    return this._createModelForName(modelName, props);
  },

  existing(modelName, modelId, opts) {
    let internal = this._existingInternalModelForModelName(modelName, modelId, opts);
    return this._internalToModel(internal);
  },

  load(modelName, id, opts) {
    if(modelName === null) {
      return this._loadInternalModelForDocId(id, opts).then(internal => {
        return this._internalToModel(internal);
      });
    } else {
      return this._loadInternalModelForModelName(modelName, id, opts).then(internal => {
        return this._internalToModel(internal);
      });
    }
  },

  // { model: 'duck', ddoc: 'ducks', view: 'by-name', key: 'yellow' }
  view(opts) {
    return this._internalModelView(opts).then(array => {
      return this._internalArrayToModelsArray(array);
    });
  },

  // { model: 'duck', selector: { type: 'duck', name: 'yellow' } }
  mango(opts) {
    return this._internalModelMango(opts).then(array => {
      return this._internalArrayToModelsArray(array);
    });
  },

  // { model: 'duck', key: 'yellow' }
  all(opts) {
    opts = merge({ optional: true }, opts);
    return this._internalModelAll(opts).then(array => {
      return this._internalArrayToModelsArray(array);
    });
  },

  find(opts) {
    opts = merge({ optional: true }, opts);
    return this._internalModelFind(opts).then(({ result, type }) => {
      if(type === 'array') {
        return this._internalArrayToModelsArray(result);
      } else {
        return this._internalToModel(result);
      }
    });
  },

  first(opts) {
    return this._internalModelFirst(opts).then(internal => {
      return this._internalToModel(internal);
    });
  }

});
