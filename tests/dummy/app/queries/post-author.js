import Ember from 'ember';
import { Query } from 'sofa';

const {
  computed
} = Ember;

export default Query.extend({

  find: computed('model.author.docId', function() {
    return { selector: { _id: this.get('model.author.docId') }};
  }),

});
