import Ember from 'ember';
import { module, test, createStore, registerModels, cleanup } from '../helpers/setup';
import { Model, prefix, belongsTo, hasMany } from 'sofa';
import { next } from 'sofa/util/run';

const {
  RSVP: { map }
} = Ember;

let store;
let db;

let Duck = Model.extend({

  id: prefix(),
  blog: belongsTo('the-blog', { inverse: 'ducks' }),
  posts: hasMany('the-post', { inverse: 'duck' })

});

let TheBlog = Model.extend({

  id: prefix(),
  ducks: hasMany('duck', { inverse: 'blog' }),
  posts: hasMany('the-post', { inverse: 'blog' })

});

let ThePost = Model.extend({

  id: prefix(),
  blog: belongsTo('the-blog', { inverse: 'posts' }),
  duck: belongsTo('duck', { inverse: 'posts' })

});

module('model-new-destroy', () => {
  registerModels({ Duck, TheBlog, ThePost });
  store = createStore();
  db = store.get('db.main');
  return cleanup(store, [ 'main' ]);
});

test('destroyed new model is removed from relationships', assert => {
  let post = db.model('the-post', { id: 'nice' });
  let blog = db.model('the-blog', { id: 'big', posts: [ post ] });
  let duck;
  return map([ blog, post ], model => model.save()).then(() => {
    duck = db.model('duck', { id: 'yellow', blog, posts: [ post ] });

    assert.ok(duck.get('blog') === blog);
    assert.ok(duck.get('posts').objectAt(0) === post);

    assert.ok(blog.get('ducks').objectAt(0) === duck);
    assert.ok(blog.get('posts').objectAt(0) === post);

    assert.ok(post.get('blog') === blog);
    assert.ok(post.get('duck') === duck);

    duck.destroy();

    return next();
  }).then(() => {
    assert.ok(duck.isDestroyed);
    assert.ok(duck.get('blog') === null);
    assert.ok(duck.get('posts.length') === 0);
    assert.ok(blog.get('ducks.length') === 0);
    assert.ok(post.get('duck') === null);
  });
});
