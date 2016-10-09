// collections/all.js
export default Collection.extend();

// collections/loaded-authors.js
export default Collection.extend({

  model: 'author'

});

// collections/approved-authors.js
export default Collection.extend({

  model: 'author',

  filter: computed('models.@each.isApproved', function() {
    return this.get('models').filterBy('isApproved', true);
  }),

});

// collections/loaded-approved-authors.js
export default Collection.extend({

  model: 'author',

  query: 'approved-authors',

  filter: computed('models.@each.isApproved', function() {
    return this.get('models').filterBy('isApproved', true);
  }),

});

// queries/approved-authors.js
export default Query.extend({

  // model -> type from collection

  collection: null,

  find: computed(function() {
    return { selector: { approved: true } };
  }),

});

//

let collection = db.collection('approved-authors');
