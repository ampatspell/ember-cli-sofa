import { Model, hasMany } from 'sofa';

export default Model.extend({

  all: hasMany(null, { inverse: null }),
  dirty: hasMany(null, { inverse: null, relationship: 'dummy-root-dirty' }),

  authors: hasMany('author', { inverse: null }),
  images: hasMany('image', { inverse: null, query: 'all-images' }),

  save() {
    throw new Error('save');
  }

});
