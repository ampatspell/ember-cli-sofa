import { Model, prefix, attr, hasOne } from 'sofa';

export default Model.extend({

  id: prefix(),
  name: attr('string'),
  email: attr('string'),

  blog: hasOne('blog', { inverse: 'author', persist: false }),

  willCreate() {
    let name = this.get('name');
    if(!name) {
      name = 'unnamed';
    }
    let id = name.trim().toLowerCase();
    this.set('id', id);
  }

});
