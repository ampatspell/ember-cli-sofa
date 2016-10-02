import { Model, prefix, attr } from 'sofa';

export default Model.extend({

  id: prefix(),
  name: attr('string'),
  email: attr('string'),

});
