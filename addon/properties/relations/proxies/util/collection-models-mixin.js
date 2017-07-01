import Ember from 'ember';

const {
  computed,
  A
} = Ember;

export const models = () => {
  return computed('_relation.internalModels.[]', function() {
    let relation = this._relation;
    let modelClass = relation.relationshipModelClass;
    let allModels = A(relation.internalModels);
    let filtered;
    if(modelClass) {
      filtered = A(allModels.filter(internal => internal.definition.is(modelClass)));
    } else {
      filtered = allModels;
    }
    return A(filtered.map(internal => internal.getModel()));
  }).readOnly();
};

export default Ember.Mixin.create({

  models: models()

});
