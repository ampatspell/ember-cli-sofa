import Ember from 'ember';

export default Ember.Mixin.create({

  push(doc, expectedModelName, optional=true) {
    let ExpectedModelClass;
    if(expectedModelName) {
      ExpectedModelClass = this.modelClassForName(expectedModelName);
    }
    let internal = this._deserializeDocumentToInternalModel(doc, ExpectedModelClass, optional);
    if(!internal) {
      return;
    }
    return internal.getModel();
  }

});
