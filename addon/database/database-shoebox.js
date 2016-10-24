import Ember from 'ember';

const {
  A
} = Ember;

export default Ember.Mixin.create({

  _createShoebox() {
    let all = this._modelIdentity.all;
    return A(all.map(internal => {
      if(internal.isNew) {
        return;
      }
      let definition = internal.definition;
      return definition.serialize(internal, false);
    })).compact();
  },

  _pushShoebox(docs) {
    return A(docs).map(doc => {
      return this.push(doc, { instantiate: false, optional: true });
    });
  }

});
