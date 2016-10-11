import Resolver from './resolver';
import Store from './store';
import Model from './model';
import Query from './query';
import Collection from './collection';

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
  Resolver,
  Store,
  Model,
  Query,
  Collection,

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
