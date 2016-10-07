import Ember from 'ember';

export default Ember.Controller.extend({

  actions: {
    file(file) {
      this.get('model.attachments').add('original', file);
    },
    save() {
      this.get('model').save();
    }
  }

});
