import Ember from 'ember';
import { Content, internal } from './content';
import { mapping } from './stub-content-internal';

const {
  computed,
  merge
} = Ember;

const data = (name) => {
  return computed(function() {
    return this._internal.data[name];
  }).readOnly();
};

const hash = {};

for(let key in mapping) {
  const value = mapping[key];
  hash[value] = data(key);
}

export default Content.extend(merge({

  url: internal('url')

}, hash));
