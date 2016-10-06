// queries/duck-house.js
export default Query.extend({

  find: computed('parent.id', function() {
    let docId = this.get('parent.docId');
    return { selector: { _id: docId } };
  }),

});
