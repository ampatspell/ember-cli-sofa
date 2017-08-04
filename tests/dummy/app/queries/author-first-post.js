import Ember from 'ember';
import { Query } from 'sofa';

const {
  computed
} = Ember;

export default Query.extend({

  find: computed(function() {
    let author = this.get('model.docId');
    return { ddoc: 'posts', view: 'by-author', key: author };
  }),

});
