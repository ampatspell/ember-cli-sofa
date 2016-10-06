import Store from 'sofa/store';
import Databases from 'sofa/databases';
import Database from 'sofa/database';

import NoopTransform from 'sofa/transforms/noop';
import StringTransform from 'sofa/transforms/string';
import IntegerTransform from 'sofa/transforms/integer';
import BooleanTransform from 'sofa/transforms/boolean';

import HasManyPersisted from 'sofa/properties/relations/proxies/has-many-persisted';
import BelongsToLoaded from 'sofa/properties/relations/proxies/belongs-to-loaded';

export default {
  name: 'sofa:internal',
  after: 'sofa:couch',
  initialize(container) {
    container.registerOptionsForType('model', { instantiate: false });
    container.registerOptionsForType('query', { instantiate: false });

    container.register('sofa:store', Store, { instantiate: false });
    container.register('sofa:databases', Databases, { instantiate: false });
    container.register('sofa:database', Database, { instantiate: false });

    container.register('sofa:has-many-persisted', HasManyPersisted, { instantiate: false });
    container.register('sofa:belongs-to-loaded', BelongsToLoaded, { instantiate: false });

    container.register('sofa:transform/noop', NoopTransform, { instantiate: false });
    container.register('sofa:transform/string', StringTransform, { instantiate: false });
    container.register('sofa:transform/integer', IntegerTransform, { instantiate: false });
    container.register('sofa:transform/boolean', BooleanTransform, { instantiate: false });
  }
};
