import Ember from 'ember';

const {
  A
} = Ember;

const shoebox = 'shoebox';

export default Ember.Mixin.create({

  _createShoeboxModels() {
    let all = this._modelIdentity.all;
    return A(all.map(internal => {
      if(internal.isNew) {
        return;
      }
      let definition = internal.definition;
      return definition.serialize(internal, shoebox);
    })).compact();
  },

  _createShoebox() {
    return {
      documents: this._createShoeboxModels(),
      collections: []
    };
  },

  _pushShoeboxCollections() {
  },

  _pushShoeboxDocument(doc) {
    return this.push(doc, { instantiate: false, optional: true, type: shoebox });
  },

  _pushShoeboxDocuments(docs) {
    return A(docs).map(doc => {
      return this._pushShoeboxDocument(doc);
    });
  },

  _pushShoebox(object) {
    return {
      models:      this._pushShoeboxDocuments(object.documents),
      collections: this._pushShoeboxCollections(object.collections)
    };
  }

});
