import Ember from 'ember';

const {
  merge
} = Ember;

export default Ember.Mixin.create({

  _collectionClassForName(name) {
    return this.get('store')._collectionClassForName(name);
  },

  collection(name, opts) {
    let collectionClass = this._collectionClassForName(name);
    return collectionClass.create(merge({ database: this }, opts));
  }

});
