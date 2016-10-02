import Ember from 'ember';

export default Ember.Component.extend({
  classNameBindings: [':ui-section', ':ui-authors'],

  authors: null,

  actions: {
    load() {
      this.get('store.db.main').find({ model: 'author', selector: { type: 'author' } }).then(models => {
        this.set('authors', models);
      });
    },
    select(author) {
      if(this.attrs.select) {
        this.attrs.select(author);
      }
    }
  }
});
