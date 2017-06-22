import Ember from 'ember';

const {
  getOwner
} = Ember;

export default Ember.Mixin.create({

  _createBelongsToLoadedProxyForRelation(_relation) {
    let owner = getOwner(this);
    return owner.factoryFor('sofa:belongs-to-loaded').create({ _relation });
  },

  _createHasManyLoadedProxyForRelation(_relation, content) {
    let owner = getOwner(this);
    return owner.factoryFor('sofa:has-many-loaded').create({ _relation, content });
  },

  _createHasManyPersistedProxyForRelation(_relation, content) {
    let owner = getOwner(this);
    return owner.factoryFor('sofa:has-many-persisted').create({ _relation, content });
  }

});
