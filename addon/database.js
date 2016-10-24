import Ember from 'ember';

import DatabaseModelClass from './database/database-model-class';
import DatabaseModel from './database/database-model';
import DatabasePush from './database/database-push';
import DatabaseDeserialize from './database/database-deserialize';
import DatabaseSerialize from './database/database-serialize';
import DatabaseInternalModelIdentity from './database/database-internal-model-identity';
import DatabaseInternalModel from './database/database-internal-model';
import DatabaseCollection from './database/database-collection';
import DatabaseSecurity from './database/database-security';
import DatabaseShoebox from './database/database-shoebox';

export default Ember.Object.extend(
  DatabaseModelClass,
  DatabaseModel,
  DatabasePush,
  DatabaseDeserialize,
  DatabaseSerialize,
  DatabaseInternalModelIdentity,
  DatabaseInternalModel,
  DatabaseCollection,
  DatabaseSecurity,
  DatabaseShoebox, {

  identifier: null,

  store:     null,
  couch:     null,
  documents: null,

});
