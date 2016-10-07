import Ember from 'ember';
import Content from './content';

const {
  computed
} = Ember;

const internal = (prop) => {
  return computed(function() {
    return this._internal[prop];
  }).readOnly();
}

export default Content.extend({

  data: internal('data'),

});
