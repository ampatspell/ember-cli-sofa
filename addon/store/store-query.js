import Ember from 'ember';

export default Ember.Mixin.create({

  _createQueryForName(query, props, variant) {
    return this._queryClassForName({ name: query, variant })._create(props);
  },

  _createQueryForRelation(_relation, variant) {
    let query = _relation.relationship.opts.query;
    if(!query) {
      let relationship = _relation.getValue();
      query = relationship.get('query');
    }
    return this._createQueryForName(query, { _relation }, variant);
  },

  _createQueryForInternalCollection(_internalCollection, variant) {
    let collection = _internalCollection.getCollectionModel();
    let query = collection.get('query') || collection.get('queryName');
    if(!query) {
      return;
    }
    return this._createQueryForName(query, { _internalCollection }, variant);
  }

});
