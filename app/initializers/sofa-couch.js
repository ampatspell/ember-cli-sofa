import Couches from 'sofa/couch/couches';
import Couch from 'sofa/couch/couch';
import CouchRequest from 'sofa/couch/request';
import CouchDatabases from 'sofa/couch/databases';
import CouchDatabase from 'sofa/couch/database';

export default {
  name: 'sofa:couch',
  initialize(container) {
    container.register('couch:couches', Couches, { instantiate: false });
    container.register('couch:main', Couch, { instantiate: false });
    container.register('couch:request', CouchRequest, { instantiate: false });
    container.register('couch:databases', CouchDatabases, { instantiate: false });
    container.register('couch:database', CouchDatabase, { instantiate: false });
  }
};
