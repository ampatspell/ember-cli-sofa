import Ember from 'ember';

export default Ember.Mixin.create({

  _createShoebox() {
    let all = this._modelIdentity.all;
    return Ember.A(all.map(internal => {
      if(internal.isNew) {
        return;
      }
      let definition = internal.definition;
      return definition.serialize(internal, false);
    })).compact();
  },

  _pushShoebox(docs) {
    return Ember.A(docs).map(doc => {
      return this.push(doc, { instantiate: false, optional: true });
    });
  }

});
