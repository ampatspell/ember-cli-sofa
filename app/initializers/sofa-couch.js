import Couches from 'sofa/couch/couches';
import Couch from 'sofa/couch/couch';
import Request from 'sofa/couch/request';
import Session from 'sofa/couch/couch/session';
import Databases from 'sofa/couch/databases';
import Database from 'sofa/couch/database';
import Security from 'sofa/couch/database/security';
import Design from 'sofa/couch/database/design';

export default {
  name: 'sofa:couch',
  initialize(container) {
    container.register('couch:couches', Couches, { instantiate: false });
    container.register('couch:main', Couch, { instantiate: false });
    container.register('couch:request', Request, { instantiate: false });
    container.register('couch:session', Session, { instantiate: false });
    container.register('couch:databases', Databases, { instantiate: false });
    container.register('couch:database', Database, { instantiate: false });
    container.register('couch:security', Security, { instantiate: false });
    container.register('couch:design', Design, { instantiate: false });
  }
};
