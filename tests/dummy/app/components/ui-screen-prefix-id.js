import Ember from 'ember';

const {
  computed
} = Ember;

export default Ember.Component.extend({
  classNameBindings: [':ui-screen-prefix-id', ':block'],

  model: computed(function() {
    return this.get('store.db.main').model('author', {
      id: 'ampatspell',
      name: 'ampatspell',
      email: 'ampatspell@gmail.com'
    });
  }),

  serialized: null,

  actions: {
    serialize() {
      this.set('serialized', this.get('model').serialize());
    },
    setNew(value) {
      this.get('model._internal').setState({ isNew: value }, true);
    },
    setDirty(value) {
      this.get('model._internal').setState({ isDirty: value }, true);
    }
  }

});
