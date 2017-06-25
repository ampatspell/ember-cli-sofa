import Ember from 'ember';

export default Ember.Mixin.create({

  _createQueryForRelation(_relation, variantName, variantFn) {
    let queryModelName = _relation.relationship.opts.query;
    if(!queryModelName) {
      let relationship = _relation.getValue();
      queryModelName = relationship.get('query');
    }
    let Query = this._queryClassForName(queryModelName, variantName, variantFn);
    return Query._create({ _relation });
  },

  _createQueryForInternalCollection(_internalCollection, variantName, variantFn) {
    let collection = _internalCollection.getCollectionModel();
    let queryModelName = collection.get('queryName');
    if(!queryModelName) {
      return;
    }
    let Query = this._queryClassForName(queryModelName, variantName, variantFn);
    return Query._create({ _internalCollection });
  }

});
