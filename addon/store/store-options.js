import Ember from 'ember';

export default Ember.Mixin.create({

  _isAutoloadInternalModelEnabled: true,
  _isAutoloadPersistedArrayEnabled: true,

  shouldAutoloadInternalModel() {
    return this.get('_isAutoloadInternalModelEnabled');
  },

  shouldAutoloadPersistedArray() {
    return this.get('_isAutoloadPersistedArrayEnabled');
  }

});
