import { Model, prefix, attr, hasMany } from 'sofa';

export default Model.extend({

  id: prefix(),
  name: attr('string'),
  email: attr('string'),

  blogs: hasMany('blog', { inverse: 'authors' }),

  willCreate() {
    let name = this.get('name');
    if(!name) {
      name = 'unnamed';
    }
    let id = name.trim().toLowerCase();
    this.set('id', id);
  }

});
