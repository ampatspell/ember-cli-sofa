import Store from 'sofa/store';

export default Store.extend({

  databaseOptionsForIdentifier(identifier) {
    let url = 'http://127.0.0.1:5984';
    if(identifier === 'main') {
      return { url, name: 'thing' };
    }
    if(identifier === 'index65') {
      return { url, name: 'index65_prev' };
    }
    if(identifier === 'test-main') {
      return { url, name: 'ember-cli-sofa-test-main' };
    }
  }

});
