import Ember from 'ember';

export default Ember.Object.extend({

  store: null,

  unknownProperty(key) {
    return this.get("store").database(key);
  }

});
