import { Model, prefix, attr, belongsTo } from 'sofa';

export default Model.extend({

  id: prefix(),
  name: attr('string'),
  author: belongsTo('author', { inverse: 'blog' })

});
