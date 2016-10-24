import Ember from 'ember';
import Model from '../model';

const {
  computed,
  getOwner,
  A
} = Ember;

export default Ember.Mixin.create({

  _applicationModulePrefix: computed(function() {
    return getOwner(this).application.modulePrefix;
  }),

  modelNames: computed(function() {
    /* global require */
    let name = this.get('_applicationModulePrefix');
    let prefix = `${name}/models/`;
    let entries = require.entries;
    return A(Object.keys(entries)).filter(key => {
      if(key.indexOf(prefix) !== 0) {
        return;
      }
      let Class = require(key).default;
      if(!Class) {
        return;
      }
      return Model.detect(Class);
    }).map(key => {
      return key.substring(prefix.length);
    });
  })

});
