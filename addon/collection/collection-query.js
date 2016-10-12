import Ember from 'ember';

const {
  computed
} = Ember;

const collection = () => {
  return computed(function() {
    return this._internalCollection.getCollectionModel();
  }).readOnly();
};

export default Ember.Mixin.create({

  _internalCollection: null,

  collection: collection(),

  _invokeFind(database, opts) {
    return database.find(opts);
  },

  _find() {
    let internal = this._internalCollection;
    let database = internal.database;
    let model = internal.getCollectionModel().get('modelName');
    return this.__find(database, model);
  },

  _isLoadable: computed('find', function() {
    let find = this.get('find');
    if(!find) {
      return false;
    }
    return true;
  }),

});
