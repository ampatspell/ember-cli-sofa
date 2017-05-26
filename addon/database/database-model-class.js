import Ember from 'ember';

const {
  computed,
  A
} = Ember;

export default Ember.Mixin.create({

  modelNames: null,

  modelClasses: computed('modelNames', 'store.modelNames', function() {
    return A(this.get('modelNames') || this.get('store.modelNames')).map(modelName => {
      return this.modelClassForName(modelName);
    });
  }),

  modelClassForName(modelName) {
    return this.get('store').modelClassForName(modelName);
  },

  _definitionForModelClass(modelClass) {
    return this.get('store')._definitionForModelClass(modelClass);
  },

  _modelClassForDocument(doc) {
    return this.get('modelClasses').find(modelClass => {
      let definition = this._definitionForModelClass(modelClass);
      return definition.matchesDocument(doc);
    });
  }

});
