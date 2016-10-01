import Ember from 'ember';

import DatabaseModelClass from './database/database-model-class';
import DatabaseModel from './database/database-model';
import DatabasePush from './database/database-push';

export default Ember.Object.extend(DatabaseModelClass, DatabaseModel, DatabasePush, {

  store:      null,
  identifier: null,
  documents:  null,

});
