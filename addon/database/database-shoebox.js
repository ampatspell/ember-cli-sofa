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

  _createShoeboxCollections() {
    let pairs = this._collectionIdentity;
    let result = {};
    for(let indentifier in pairs) {
      let internal = pairs[indentifier];
      let serialized = internal.serialize(shoebox);
      if(serialized) {
        result[indentifier] = serialized;
      }
    }
    return result;
  },

  _createShoebox() {
    return {
      documents:   this._createShoeboxModels(),
      collections: this._createShoeboxCollections()
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
