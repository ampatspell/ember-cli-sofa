import Ember from 'ember';
import { Query } from 'sofa';

const {
  computed
} = Ember;

export default Query.extend({

  find: computed('model.docId', function() {
    let author = this.get('model.docId');
    return {
      selector: {
        authors: {
          $elemMatch: {
            $eq: author
          }
        }
      }
    };
  }),

});
