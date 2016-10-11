import Ember from 'ember';

Ember.Resolver.reopen({
  init() {
    this._super(...arguments);
    this.pluralizedTypes = {
      query: 'queries',
      'sofa/query': 'sofa/queries'
    };
  }
});

export default {
  name: 'sofa:resolver',
  initialize() {}
};
