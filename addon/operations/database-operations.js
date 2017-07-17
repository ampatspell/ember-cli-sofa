import Ember from 'ember';
import InternalOperation from './internal-operation';
import { array } from '../util/computed';

const {
  RSVP: { all, resolve }
} = Ember;

const noop = () => {};

export default Ember.Object.extend({

  internalOperations: array(),

  register(name, subject, promise) {
    let op = new InternalOperation(this, name, subject, promise);
    this.get('internalOperations').pushObject(op);
    return op;
  },

  wait() {
    return all(this.get('internalOperations').map(op => op.promise.then(noop, noop)));
  },

  _internalOperationDidFinish(op) {
    this.get('internalOperations').removeObject(op);
  }

});
