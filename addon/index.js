import Store from './store';
import Model from './model';
import Query from './query';

import {
  id,
  prefix,
  rev,
  type,
  attr,
  belongsTo,
  hasMany
} from './properties/helpers';

const hasOne = belongsTo;

export {
  Store,
  Model,
  Query,

  id,
  prefix,
  rev,
  type,
  attr,
  belongsTo,
  hasOne,
  hasMany
};

export default Store;
