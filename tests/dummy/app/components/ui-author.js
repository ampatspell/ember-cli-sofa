import Ember from 'ember';

export default Ember.Component.extend({
  classNameBindings: [':ui-section', ':ui-author'],

  author: null,

  actions: {
    save() {
      this.get('author').save();
    },
    delete() {
      this.get('author').delete();
    }
  }
});
