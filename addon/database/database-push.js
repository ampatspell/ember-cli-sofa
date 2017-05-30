import Ember from 'ember';

const {
  merge
} = Ember;

export default Ember.Mixin.create({

  push(doc, opts) {
    opts = merge({ optional: false, instantiate: true, type: null }, opts);

    let ExpectedModelClass;
    if(opts.model) {
      ExpectedModelClass = this.modelClassForName(opts.model);
    }

    let internal = this._deserializeDocumentToInternalModel(doc, ExpectedModelClass, opts.optional, opts.type);
    if(!internal) {
      return;
    }

    if(opts.instantiate) {
      return internal.getModel();
    } else {
      return { model: internal.modelName, id: internal.values.id, deleted: internal.state.isDeleted };
    }
  }

});
