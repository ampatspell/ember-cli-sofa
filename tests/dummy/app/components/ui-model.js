import Ember from 'ember';

export default Ember.Component.extend({
  classNameBindings: [':ui-model'],

  actions: {
    save() {
      this.get('model').save();
    },
    delete() {
      this.get('model').delete();
    }
  }
});
