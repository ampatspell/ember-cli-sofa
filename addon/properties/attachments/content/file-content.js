import Ember from 'ember';
import { Content, internal } from './content';

const {
  computed
} = Ember;

const file = (key) => {
  return computed(function() {
    return this._internal.file[key];
  }).readOnly();
};

export default Content.extend({

  contentType: file('contentType'),
  length:      file('size'),

});
