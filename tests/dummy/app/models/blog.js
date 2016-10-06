import { Model, prefix, attr, hasMany } from 'sofa';

export default Model.extend({

  id: prefix(),
  name: attr('string'),

  authors: hasMany('author', { inverse: 'blogs' })

});
