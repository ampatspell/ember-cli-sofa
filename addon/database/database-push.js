import Ember from 'ember';

export default Ember.Mixin.create({

  push(doc) {
    let modelClass = this.modelClassForName(doc.type);
    let internal = this.get('store')._createLoadedInternalModel(modelClass, this, doc);
    return internal.getModel();
  }

});
