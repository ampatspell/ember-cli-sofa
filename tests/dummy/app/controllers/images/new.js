import Ember from 'ember';

export default Ember.Controller.extend({

  actions: {
    file(file) {
      let attachments = this.get('model.attachments');
      let original = attachments.findBy('name', 'original');
      if(original) {
        attachments.removeObject(original);
      }
      attachments.pushObject({ name: 'original', data: file });
    },
    save() {
      this.get('model').save();
    }
  }

});
