import Ember from 'ember';
import { isObject, isFunction_ } from './assert';
import { object, array, lookup } from 'couch/util/computed';

const {
  computed
} = Ember;

export function createInternal(InternalClass) {
  return computed(function() {
    return new InternalClass(this);
  }).readOnly();
}

export function forwardCall(prop) {
  return function(name) {
    return function(...args) {
      let object = this.get(prop);
      isObject(prop, object);
      let fn = object[name];
      isFunction_(`${prop}.${name} must be function not ${fn}`, fn);
      return fn.call(object, ...args);
    };
  };
}

export {
  object,
  array,
  lookup
};
