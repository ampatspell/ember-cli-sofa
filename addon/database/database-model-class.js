import Ember from 'ember';

const {
  computed,
  computed: { alias }
} = Ember;

export default Ember.Mixin.create({

  modelNames: alias('store.modelNames'),

  modelClasses: computed('modelNames', function() {
    return Ember.A(this.get('modelNames')).map(modelName => {
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
