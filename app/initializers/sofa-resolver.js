import Ember from 'ember';

Ember.Resolver.reopen({
  init() {
    this._super(...arguments);
    this.pluralizedTypes = {
      query: 'queries'
    };
  }
});

export default {
  name: 'sofa:resolver',
  initialize() {}
};
