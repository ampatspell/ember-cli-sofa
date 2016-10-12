import Ember from 'ember';

const {
  assert
} = Ember;

export default Ember.Mixin.create({

  _invokeFind(database, opts) {
    assert(`override _invokeFind and don't call super ${this} ${database} ${opts}`, false);
  },

  __find(database, model) {
    let opts = this.get('find');
    assert(`Query._find should not be called when find returns ${opts}`, !!opts);

    if(!opts.hasOwnProperty('model')) {
      opts.model = model;
    }

    return this._invokeFind(database, opts);
  },

});
