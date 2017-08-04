import Ember from 'ember';

const {
  inject: { service },
  RSVP: { hash },
  computed: { reads }
} = Ember;

export default Ember.Component.extend({
  classNameBindings: [':ui-screen', ':index'],

  session: reads('store.db.main.couch.session'),
  design: service(),

  info: null,

  actions: {
    info() {
      hash({
        couch: this.get('store.db.main.documents.couch').info(),
        db: this.get('store.db.main.documents').info()
      }).then(info => {
        this.set('info', info);
      });
    },
    ddocs() {
      this.get('design').insert();
    }
  }
});
