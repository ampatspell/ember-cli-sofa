import { Model, prefix, attr, belongsTo } from 'sofa';

// http://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
function makeid(len=8) {
  let text = '';
  let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for(let i=0; i<len; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

export default Model.extend({

  id: prefix(),
  title: attr('string'),
  body: attr('string'),

  author: belongsTo('author', { inverse: 'posts', query: 'post-author' }),

  willCreate() {
    this.set('id', makeid());
  }

});
