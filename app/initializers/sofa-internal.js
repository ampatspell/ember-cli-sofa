import Store from 'sofa/store';
import Couches from 'sofa/couches';
import Couch from 'sofa/couch';
import Session from 'sofa/session';
import Databases from 'sofa/databases';
import Database from 'sofa/database';
import DatabaseSecurity from 'sofa/security';
import DatabaseSecurityPair from 'sofa/security-pair';

import NoopTransform from 'sofa/transforms/noop';
import StringTransform from 'sofa/transforms/string';
import IntegerTransform from 'sofa/transforms/integer';
import FloatTransform from 'sofa/transforms/float';
import BooleanTransform from 'sofa/transforms/boolean';
import DateTransform from 'sofa/transforms/date';
import JSONTransform from 'sofa/transforms/json';

import BelongsToLoaded from 'sofa/properties/relations/proxies/belongs-to-loaded';
import HasManyPersisted from 'sofa/properties/relations/proxies/has-many-persisted';
import HasManyLoaded from 'sofa/properties/relations/proxies/has-many-loaded';

import Attachments from 'sofa/properties/attachments/attachments';
import Attachment from 'sofa/properties/attachments/attachment';
import AttachmentStringContent from 'sofa/properties/attachments/content/string-content';
import AttachmentFileContent from 'sofa/properties/attachments/content/file-content';
import AttachmentStubContent from 'sofa/properties/attachments/content/stub-content';

export default {
  name: 'sofa:internal',
  after: 'sofa:couch',
  initialize(container) {
    container.registerOptionsForType('model', { instantiate: false });
    container.registerOptionsForType('query', { instantiate: false });
    container.registerOptionsForType('collection', { instantiate: false });
    container.registerOptionsForType('sofa-database', { instantiate: false });

    container.register('sofa:store', Store, { instantiate: false });
    container.register('sofa:couches', Couches, { instantiate: false });
    container.register('sofa:couch', Couch, { instantiate: false });
    container.register('sofa:session', Session, { instantiate: false });
    container.register('sofa:databases', Databases, { instantiate: false });
    container.register('sofa:database', Database, { instantiate: false });
    container.register('sofa:database-security', DatabaseSecurity, { instantiate: false });
    container.register('sofa:database-security-pair', DatabaseSecurityPair, { instantiate: false });

    container.register('sofa:belongs-to-loaded', BelongsToLoaded, { instantiate: false });
    container.register('sofa:has-many-persisted', HasManyPersisted, { instantiate: false });
    container.register('sofa:has-many-loaded', HasManyLoaded, { instantiate: false });

    container.register('sofa:transform/noop', NoopTransform, { instantiate: false });
    container.register('sofa:transform/string', StringTransform, { instantiate: false });
    container.register('sofa:transform/integer', IntegerTransform, { instantiate: false });
    container.register('sofa:transform/float', FloatTransform, { instantiate: false });
    container.register('sofa:transform/boolean', BooleanTransform, { instantiate: false });
    container.register('sofa:transform/date', DateTransform, { instantiate: false });
    container.register('sofa:transform/json', JSONTransform, { instantiate: false });

    container.register('sofa:attachments', Attachments, { instantiate: false });
    container.register('sofa:attachment', Attachment, { instantiate: false });
    container.register('sofa:attachment-content/string', AttachmentStringContent, { instantiate: false });
    container.register('sofa:attachment-content/file', AttachmentFileContent, { instantiate: false });
    container.register('sofa:attachment-content/stub', AttachmentStubContent, { instantiate: false });
  }
};
