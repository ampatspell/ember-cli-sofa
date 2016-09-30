import Store from 'sofa/store';
import Databases from 'sofa/databases';
import Database from 'sofa/database';

export default {
  name: 'sofa:internal',
  after: 'sofa:couch',
  initialize(container) {
    container.registerOptionsForType('model', { instantiate: false });

    container.register('sofa:store', Store, { instantiate: false });
    container.register('sofa:databases', Databases, { instantiate: false });
    container.register('sofa:database', Database, { instantiate: false });
  }
};
