import Ember from 'ember';

import DatabaseModelClass from './database/database-model-class';
import DatabaseModel from './database/database-model';
import DatabasePush from './database/database-push';
import DatabaseDeserialize from './database/database-deserialize';
import DatabaseSerialize from './database/database-serialize';
import DatabaseModelIdentity from './database/database-model-identity';
import DatabaseModelOperations from './database/database-model-operations';

export default Ember.Object.extend(
  DatabaseModelClass,
  DatabaseModel,
  DatabasePush,
  DatabaseDeserialize,
  DatabaseSerialize,
  DatabaseModelIdentity,
  DatabaseModelOperations, {

  store:      null,
  identifier: null,
  documents:  null,

});
