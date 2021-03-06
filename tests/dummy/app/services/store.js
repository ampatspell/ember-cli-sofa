import Ember from 'ember';
import { Store } from 'sofa';

const {
  computed: { reads }
} = Ember;

const url = '/api/dummy';

const prop = key => {
  return reads(`root.${key}`).readOnly();
};

export default Store.extend({

  databaseOptionsForIdentifier(identifier) {
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

  root: reads('db.main.root'),

  allModels: prop('all'),
  dirtyModels: prop('dirty'),
  authors: prop('authors'),
  images: prop('images')

});
