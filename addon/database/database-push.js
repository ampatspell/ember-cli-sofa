import Ember from 'ember';

const {
  merge
} = Ember;

class Push {
  constructor(database, model, id, deleted) {
    this.database = database;
    this.model = model;
    this.id = id;
    this.deleted = deleted;
  }

  get(opts) {
    return this.database.existing(this.model, this.id, opts);
  }

  toJSON() {
    let { model, id, deleted } = this;
    return {
      model,
      id,
      deleted
    };
  }

}

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
      let model = internal.modelName;
      let id = internal.id;
      let deleted = internal.state.isDeleted;
      return new Push(this, model, id, deleted);
    }
  }

});
