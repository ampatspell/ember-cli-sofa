import Error from './util/error';
import Store from './store';
import Database from './database';
import Session from './session';
import Model from './model';
import Query from './query';
import Collection from './collection/collection';

import Stub from './properties/attachments/content/stub-content';

import {
  id,
  prefix,
  rev,
  type,
  attr,
  belongsTo,
  hasMany,
  attachments
} from './properties/helpers';

const hasOne = belongsTo;

export {
  Error,

  Database,
  Session,
  Store,
  Model,
  Query,
  Collection,

  Stub,

  id,
  prefix,
  rev,
  attachments,
  type,
  attr,
  belongsTo,
  hasOne,
  hasMany
};

export default Store;
