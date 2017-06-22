import Ember from 'ember';
import StoreDatabase from './store/store-database';
import StoreClass from './store/store-class';
import StoreModelClass from './store/store-model-class';
import StoreQueryClass from './store/store-query-class';
import StoreInternalModel from './store/store-internal-model';
import StoreModel from './store/store-model';
import StoreCollection from './store/store-collection';
import StoreTransform from './store/store-transform';
import StoreDestroy from './store/store-destroy';
import StoreModelNames from './store/store-model-names';
import StoreCollectionClass from './store/store-collection-class';
import StoreModelAttachments from './store/store-model-attachments';
import StoreRelation from './store/store-relation';
import StoreChangesClass from './store/store-changes-class';
import StoreChanges from './store/store-changes';
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
  StoreCollection,
  StoreRelation,
  StoreChangesClass,
  StoreChanges,
  StoreTransform,
  StoreModelNames,
  StoreDestroy,
  StoreCollectionClass,
  StoreModelAttachments,
  StoreShoebox, {

  find() {
    warn(this+'', '`find`', ...arguments);
  }

});
