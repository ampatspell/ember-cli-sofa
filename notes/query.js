import { Model, hasMany, query } from 'sofa';

export default Model.extend({

  author: hasMany('posts', { inverse: 'images', query: query({ selector: { author: query.prop('docId') } }) })

});

function propsFromHash(hash) {
  // ...
  return [ 'docId' ];
}

export default function makeQuery(hash) {
  let keys = propsFromHash(hash);
  return Query.extend({
    find: computed(...keys, function() {
      return this.find()...
    }).readOnly();
  });
}
