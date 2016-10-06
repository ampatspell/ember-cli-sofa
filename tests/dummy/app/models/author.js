import { Model, prefix, attr, hasMany, belongsTo } from 'sofa';

export default Model.extend({

  id: prefix(),
  name: attr('string'),
  email: attr('string'),

  blogs: hasMany('blog', { inverse: 'authors', query: 'author-blogs' }),
  posts: hasMany('post', { inverse: 'author', persist: false }),

  post: belongsTo('post', { query: 'author-first-post' }),

  willCreate() {
    let name = this.get('name');
    if(!name) {
      name = 'unnamed';
    }
    let id = name.trim().toLowerCase();
    this.set('id', id);
  }

});
