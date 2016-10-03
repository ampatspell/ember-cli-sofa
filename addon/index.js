import Store from './store';
import Model from './model';

import {
  id,
  prefix,
  rev,
  type,
  attr,
  belongsTo
} from './properties/helpers';

const hasOne = belongsTo;

export {
  Store,
  Model,

  id,
  prefix,
  rev,
  type,
  attr,
  belongsTo,
  hasOne
};

export default Store;
