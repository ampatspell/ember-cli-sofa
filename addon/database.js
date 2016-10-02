import Ember from 'ember';

import DatabaseModelClass from './database/database-model-class';
import DatabaseModel from './database/database-model';
import DatabasePush from './database/database-push';
import DatabaseDeserialize from './database/database-deserialize';
import DatabaseSerialize from './database/database-serialize';
import DatabaseInternalModelIdentity from './database/database-internal-model-identity';
import DatabaseInternalModel from './database/database-internal-model';

export default Ember.Object.extend(
  DatabaseModelClass,
  DatabaseModel,
  DatabasePush,
  DatabaseDeserialize,
  DatabaseSerialize,
  DatabaseInternalModelIdentity,
  DatabaseInternalModel, {

  store:      null,
  identifier: null,
  documents:  null,

});
