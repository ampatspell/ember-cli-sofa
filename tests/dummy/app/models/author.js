import { Model, prefix, attr } from 'sofa';

export default Model.extend({

  id: prefix(),
  name: attr('string'),
  email: attr('string'),

  notifyPropertyChange() {
    this._super(...arguments);
  },

  willCreate() {
    let name = this.get('name');
    if(!name) {
      name = 'unnamed';
    }
    let id = name.trim().toLowerCase();
    this.set('id', id);
  }

});
