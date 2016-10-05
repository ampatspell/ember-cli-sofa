import Ember from 'ember';

const {
  computed
} = Ember;

export default Ember.ObjectProxy.extend({

  _relation: null,

  content: computed({
    get() {
      return this._relation.getModel();
    },
    set(key, value) {
      return this._relation.setModel(value);
    }
  })

});
