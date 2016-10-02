import Ember from 'ember';

export default Ember.Mixin.create({

  model(modelName, props) {
    return this.get('store')._createModelForName(modelName, this, props);
  },

  existing(modelName, modelId, opts) {
    let internal = this._existingInternalModelForModelName(modelName, modelId, opts);
    if(internal) {
      return internal.getModel();
    }
  },

  load(modelName, modelId, opts) {
    return this._loadInternalModelForModelName(modelName, modelId, opts).then(internal => {
      return internal.getModel();
    });
  },

  _internalModelsToModels(array) {
    // TODO: ArrayProxy which lazy-creates models
    return Ember.A(array.map(internal => {
      return internal.getModel();
    }));
  },

  // { model: 'duck', ddoc: 'ducks', view: 'by-name', key: 'yellow' }
  view(opts) {
    return this._internalModelView(opts).then(array => {
      return this._internalModelsToModels(array);
    });
  },

  // { model: 'duck', selector: { type: 'duck', name: 'yellow' } }
  mango(opts) {
    return this._internalModelMango(opts).then(array => {
      return this._internalModelsToModels(array);
    });
  },

  // { model: 'duck', key: 'yellow' }
  all(opts) {
    return this._internalModelAll(opts).then(array => {
      return this._internalModelsToModels(array);
    });
  }

  /*
    db.find({ model: 'author', id: 'ampatspell' })
    db.find({ id: 'author:ampatspell' })

    db.find({ model: 'author', ddoc: 'author', view: 'by-name', key: 'ampatspell' })
    db.find({ model: 'author', selector: { type: 'author', name: 'ampatspell' } });

    same goes for first

    db.first({ id: 'author:ampatspell', optional: true });
  */

});
