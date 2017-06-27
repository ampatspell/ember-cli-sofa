import Ember from 'ember';

import DatabaseModelClass from './database/database-model-class';
import DatabaseModel from './database/database-model';
import DatabasePush from './database/database-push';
import DatabaseDeserialize from './database/database-deserialize';
import DatabaseSerialize from './database/database-serialize';
import DatabaseInternalModelIdentity from './database/database-internal-model-identity';
import DatabaseInternalModel from './database/database-internal-model';
import DatabaseSecurity from './database/database-security';
import DatabaseShoebox from './database/database-shoebox';
import DatabaseChanges from './database/database-changes';
import DatabaseInternalChangesIdentity from './database/database-internal-changes-identity';
import DatabaseDestroy from './database/database-destroy';

export default Ember.Object.extend(
  DatabaseModelClass,
  DatabaseModel,
  DatabasePush,
  DatabaseDeserialize,
  DatabaseSerialize,
  DatabaseInternalModelIdentity,
  DatabaseInternalModel,
  DatabaseSecurity,
  DatabaseShoebox,
  DatabaseChanges,
  DatabaseInternalChangesIdentity,
  DatabaseDestroy, {

  identifier: null,

  store:     null,
  couch:     null,
  documents: null,

});
