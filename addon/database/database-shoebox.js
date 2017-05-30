import Ember from 'ember';

const {
  A
} = Ember;

const shoebox = 'shoebox';

export default Ember.Mixin.create({

  _createShoebox() {
    let all = this._modelIdentity.all;
    return A(all.map(internal => {
      if(internal.isNew) {
        return;
      }
      let definition = internal.definition;
      return definition.serialize(internal, shoebox);
    })).compact();
  },

  _pushShoeboxDocument(doc) {
    return this.push(doc, { instantiate: false, optional: true, type: shoebox });
  },

  _pushShoebox(docs) {
    return A(docs).map(doc => {
      return this._pushShoeboxDocument(doc);
    });
  }

});
