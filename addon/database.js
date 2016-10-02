import Ember from 'ember';

import DatabaseModelClass from './database/database-model-class';
import DatabaseModel from './database/database-model';
import DatabasePush from './database/database-push';
import DatabaseDeserialize from './database/database-deserialize';
import DatabaseModelIdentity from './database/database-model-identity';

export default Ember.Object.extend(
  DatabaseModelClass,
  DatabaseModel,
  DatabasePush,
  DatabaseDeserialize,
  DatabaseModelIdentity, {

  store:      null,
  identifier: null,
  documents:  null,

});
