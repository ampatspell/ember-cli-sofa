import Ember from 'ember';
import StoreDatabase from './store/store-database';
import StoreClass from './store/store-class';
import StoreModelClass from './store/store-model-class';
import StoreQueryClass from './store/store-query-class';
import StoreInternalModel from './store/store-internal-model';
import StoreModel from './store/store-model';
import StoreTransform from './store/store-transform';
import StoreDestroy from './store/store-destroy';
import StoreModelNames from './store/store-model-names';
import StoreCollectionClass from './store/store-collection-class';
import StoreShoebox from './store/store-shoebox';

const {
  Logger: { warn }
} = Ember;

export default Ember.Service.extend(
  StoreDatabase,
  StoreClass,
  StoreModelClass,
  StoreQueryClass,
  StoreInternalModel,
  StoreModel,
  StoreTransform,
  StoreModelNames,
  StoreDestroy,
  StoreCollectionClass,
  StoreShoebox, {

  find() {
    warn(this+'', '`find`', ...arguments);
  }

});
