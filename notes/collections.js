// Collections
// isNew models also should be included

let state = internal.state;
let values = internal.values;
let hash = { state, values };

// collections/authors.js
export default Collection.extend({

  observes: [
    'type'
  ],

  matches(internal) {
    if(internal.state.isNew) {
      return;
    }
    return internal.values.type === 'author';
  }

});

// collections/authors.js
export default Collection.extend({

  observes: [
    'type'
  ],

  query: {
    model: 'author',
    selector: { },
    limit: 25
  },

  matches(values) {
    return values.type === 'author';
  },

});

// collections/authors.js
export default Collection.extend({

  model: 'author',

  query: {
    selector: {},
    limit: 25
  }

});

// collections/approved-authors.js
export default Collection.extend({

  model: 'author',

  query: {
    selector: { /* type: author, */ approved: true },
    limit: 25
  },

  // _matchesModel(values) {
  //   return values.type === 'author';
  // },

  // matches(values) {
  //   return values.approved === true;
  // }

});


// Model proxy

export default First.extend({

  // same thing
  // calls db.first

});

// first -- when there are multiple 'first' in identity?
// one is content, another also matches
// first doesn't match anymore, should set next
// implement as a mixin for both
