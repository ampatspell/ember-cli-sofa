import Ember from 'ember';
import StoreDatabase from './store/store-database';
import StoreClass from './store/store-class';
import StoreModelClass from './store/store-model-class';
import StoreInternalModel from './store/store-internal-model';
import StoreModel from './store/store-model';
import StoreTransform from './store/store-transform';
import StoreDestroy from './store/store-destroy';

const {
  Logger: { warn }
} = Ember;

export default Ember.Service.extend(
  StoreDatabase,
  StoreClass,
  StoreModelClass,
  StoreInternalModel,
  StoreModel,
  StoreTransform,
  StoreDestroy, {

  find() {
    warn(this+'', '`find`', ...arguments);
  }

});
