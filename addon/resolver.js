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

  // sofa/session
  // sofa/databases/main
  // sofa/databases/users

  sofaModuleName(parsedName) {
    return parsedName.prefix + '/sofa/' +  this.pluralize(parsedName.type) + '/' + parsedName.fullNameWithoutType;
  },

});
