import Ember from 'ember';
import InternalOperation from './internal-operation';
import { array } from '../util/computed';

const {
  RSVP: { all }
} = Ember;

export default Ember.Object.extend({

  internalOperations: array(),

  register(promise) {
    let op = new InternalOperation(this, promise);
    this.get('internalOperations').pushObject(op);
    return op;
  },

  wait() {
    return all(this.get('internalOperations').map(op => op.done));
  },

  settle() {
    return this.wait();
  },

  _internalOperationDidFinish(op) {
    this.get('internalOperations').removeObject(op);
  }

});
