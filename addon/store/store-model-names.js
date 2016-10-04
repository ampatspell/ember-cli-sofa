import Ember from 'ember';
import Model from '../model';

const {
  computed,
  getOwner
} = Ember;

export default Ember.Mixin.create({

  _applicationName: computed(function() {
    return getOwner(this).application.name;
  }),

  modelNames: computed(function() {
    let name = this.get('_applicationName');
    let prefix = `${name}/models/`;
    let entries = require.entries;
    return Ember.A(Object.keys(entries)).filter(key => {
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
