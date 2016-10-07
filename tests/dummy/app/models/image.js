import { Model, attr } from 'sofa';

export default Model.extend({

  comment: attr('string'),
  createdAt: attr('date', { key: 'created_at' }),

});
