import Resolver from 'ember-resolver';

const {
  computed
} = Ember;

export default Resolver.extend({

  moduleNameLookupPatterns: computed(function() {
    let patterns = Ember.A(this._super());
    patterns.push(this.sofaModuleName);
    return patterns;
  }),

  sofaModuleName(parsedName) {
    if(parsedName.type !== 'sofa-database') {
      return;
    }
    let ret = parsedName.prefix + '/sofa/databases/' + parsedName.fullNameWithoutType;
    console.log(parsedName, ret);
    return ret;
  },

});
