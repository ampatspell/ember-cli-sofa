import { Store } from 'sofa';

export default Store.extend({

  databaseOptionsForIdentifier(identifier) {
    let url = '/api';
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
