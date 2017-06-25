import Ember from 'ember';

export default Ember.Mixin.create({

  _createQueryForName(query, props, variantName, variantFn) {
    return this._queryClassForName(query, variantName, variantFn)._create(props);
  },

  _createQueryForRelation(_relation, variantName, variantFn) {
    let query = _relation.relationship.opts.query;
    if(!query) {
      let relationship = _relation.getValue();
      query = relationship.get('query');
    }
    return this._createQueryForName(query, { _relation }, variantName, variantFn);
  },

  _createQueryForInternalCollection(_internalCollection, variantName, variantFn) {
    let collection = _internalCollection.getCollectionModel();
    let query = collection.get('query') || collection.get('queryName');
    if(!query) {
      return;
    }
    return this._createQueryForName(query, { _internalCollection }, variantName, variantFn);
  }

});
