import Ember from 'ember';
import { Query } from 'sofa';

const {
  computed
} = Ember;

export default Query.extend({

  find: computed(function() {
    return { ddoc: 'images', view: 'all' };
  })

});
