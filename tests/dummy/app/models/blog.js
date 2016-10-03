import { Model, prefix, attr, belongsTo } from 'sofa';

export default Model.extend({

  id: prefix(),
  name: attr('string'),
  author: belongsTo('author', { inverse: 'blog' }),

  willCreate() {
    let author = this.get('author.id');
    let name = this.get('name');
    if(!name) {
      name = 'unnamed';
    }
    name = name.trim().toLowerCase();
    this.set('id', `${author}:${name}`);
  }

});
