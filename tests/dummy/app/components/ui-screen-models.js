import Ember from 'ember';

const {
  computed
} = Ember;

export default Ember.Component.extend({
  classNameBindings: [':ui-screen'],

  models: computed('store.db.main._modelIdentity.all.[]', function() {
    return this.get('store.db.main._modelIdentity.all').map(internal => {
      return internal.getModel();
    });
  }),

  actions: {
    loadAll() {
      this.get('store.db.main').find({ selector: { type: { $gt: null } } });
    },
    select(model) {
      console.log(`window.model = ${model}`);
      window.model = model;
    }
  }
});
