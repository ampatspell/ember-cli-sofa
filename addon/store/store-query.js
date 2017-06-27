import Ember from 'ember';

const {
  copy
} = Ember;

export default Ember.Mixin.create({

  _buildQueryFactoryOptions(query) {
    if(typeof query === 'string') {
      return {
        name: query
      };
    }

    let factory = copy(query);
    let name = factory.name;
    delete factory.name;

    return {
      name,
      factory
    };
  },

  _createQuery({ query, variant, properties}) {
    let { name, factory } = this._buildQueryFactoryOptions(query);
    return this._queryClassForName({
      name,
      factory,
      variant
    }).create(properties);
  },

  _createQueryForRelation(_relation, variant) {
    let query = _relation.relationship.opts.query;
    if(!query) {
      let relationship = _relation.getValue();
      query = relationship.get('query');
      if(!query) {
        return;
      }
    }
    return this._createQuery({
      query,
      variant,
      properties: { _relation }
    });
  },

  _createQueryForInternalCollection(_internalCollection, variant) {
    let collection = _internalCollection.getCollectionModel();
    let query = collection.get('query') || collection.get('queryName');
    if(!query) {
      return;
    }
    return this._createQuery({
      query,
      variant,
      properties: { _internalCollection }
    });
  }

});
