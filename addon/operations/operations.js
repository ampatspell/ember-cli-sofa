import Ember from 'ember';
import InternalOperation from './internal-operation';
import { array } from '../util/computed';
import { next } from '../util/run';

const {
  RSVP: { all }
} = Ember;

const iteration = (owner, resolve, idx=0) => {
  next().then(() => {
    let promises = owner.promises();
    if(promises.length === 0) {
      resolve();
      return;
    }
    all(promises).then(() => iteration(owner, resolve, ++idx));
  });
};

export default Ember.Object.extend({

  internalOperations: array(),

  register(promise) {
    let op = new InternalOperation(this, promise);
    this.get('internalOperations').pushObject(op);
    return op;
  },

  promises() {
    return this.get('internalOperations').map(op => op.done);
  },

  wait() {
    return all(this.promises());
  },

  settle() {
    return new Promise(resolve => iteration(this, resolve));
  },

  _internalOperationDidFinish(op) {
    this.get('internalOperations').removeObject(op);
  }

});
