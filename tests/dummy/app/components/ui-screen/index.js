import Ember from 'ember';

const {
  RSVP: { hash }
} = Ember;

export default Ember.Component.extend({
  classNameBindings: [':ui-screen', ':index'],

  info: null,

  actions: {
    info() {
      hash({
        couch: this.get('store.db.main.documents.couch').info(),
        db: this.get('store.db.main.documents').info()
      }).then(info => {
        this.set('info', info);
      });
    }
  }
});