import Store from 'sofa/store';
import Couches from 'sofa/couches';
import Couch from 'sofa/couch';
import Session from 'sofa/session';
import Databases from 'sofa/databases';
import Database from 'sofa/database';

import NoopTransform from 'sofa/transforms/noop';
import StringTransform from 'sofa/transforms/string';
import IntegerTransform from 'sofa/transforms/integer';
import BooleanTransform from 'sofa/transforms/boolean';

import BelongsToLoaded from 'sofa/properties/relations/proxies/belongs-to-loaded';
import HasManyPersisted from 'sofa/properties/relations/proxies/has-many-persisted';
import HasManyLoaded from 'sofa/properties/relations/proxies/has-many-loaded';

export default {
  name: 'sofa:internal',
  after: 'sofa:couch',
  initialize(container) {
    container.registerOptionsForType('model', { instantiate: false });
    container.registerOptionsForType('query', { instantiate: false });

    container.register('sofa:store', Store, { instantiate: false });
    container.register('sofa:couches', Couches, { instantiate: false });
    container.register('sofa:couch', Couch, { instantiate: false });
    container.register('sofa:session', Session, { instantiate: false });
    container.register('sofa:databases', Databases, { instantiate: false });
    container.register('sofa:database', Database, { instantiate: false });

    container.register('sofa:belongs-to-loaded', BelongsToLoaded, { instantiate: false });
    container.register('sofa:has-many-persisted', HasManyPersisted, { instantiate: false });
    container.register('sofa:has-many-loaded', HasManyLoaded, { instantiate: false });

    container.register('sofa:transform/noop', NoopTransform, { instantiate: false });
    container.register('sofa:transform/string', StringTransform, { instantiate: false });
    container.register('sofa:transform/integer', IntegerTransform, { instantiate: false });
    container.register('sofa:transform/boolean', BooleanTransform, { instantiate: false });
  }
};
