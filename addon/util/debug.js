import Ember from 'ember';
import globalOptions from './global-options';

const {
  copy,
  Logger: { info }
} = Ember;

export function debugDestroy(opts) {
  if(!globalOptions.destroy.debug) {
    return;
  }
  opts = copy(opts);
  let stack = new Error().stack;
  let name = window.currentTestName;
  return { opts, stack, name };
}

export function destroyed(data) {
  info(data);
  /* eslint-disable */
  debugger;
  /* eslint-enable */
}
