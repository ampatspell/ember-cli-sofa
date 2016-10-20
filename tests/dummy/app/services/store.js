import Ember from 'ember';
import { Store } from 'sofa';

const {
  computed
} = Ember;

const coll = (name) => {
  return computed(function() {
    return this.get('db.main').collection(name);
  }).readOnly();
};

export default Store.extend({

  databaseOptionsForIdentifier(identifier) {
    let url = '/api';
    if(identifier === 'main') {
      return { url, name: 'thing' };
    }
    if(identifier === 'crap') {
      return { url, name: 'crap' };
    }
    if(identifier === 'index65') {
      return { url, name: 'index65_prev' };
    }
    if(identifier === 'test-main') {
      return { url, name: 'ember-cli-sofa-test-main' };
    }
  },

  allModels: coll('all'),
  dirtyModels: coll('dirty'),

  authors: coll('authors'),

});
