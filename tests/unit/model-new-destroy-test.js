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
    assert.ok(duck.get('blog') === null);       // 8
    assert.ok(duck.get('posts.length') === 0);  // 9
    assert.ok(blog.get('ducks.length') === 0);  // 10
    assert.ok(post.get('duck') === null);       // 11
  });
});

test('destroyed new model is cleaned up', assert => {
  let post = db.model('the-post', { id: 'nice' });
  let blog = db.model('the-blog', { id: 'big', posts: [ post ] });
  let duck;
  let internal;
  return map([ blog, post ], model => model.save()).then(() => {
    duck = db.model('duck', { id: 'yellow', blog, posts: [ post ] });
    internal = duck._internal;

    duck.get('attachments').add('foo', 'hello world');

    assert.ok(duck.get('blog') === blog);
    duck.get('posts');

    assert.ok(internal);

    assert.ok(internal.values.blog.internal);
    assert.ok(internal.values.posts.internal);

    assert.ok(internal.values.blog.content);

    assert.ok(internal.values.posts.content);
    assert.ok(internal.values.posts.value);

    duck.destroy();

    return next();
  }).then(() => {
    assert.ok(internal.destroyed === true, 'destroyed');
    assert.ok(internal.observers.length === 0, 'should be no observers');
    assert.ok(!internal.values.blog.content, 'belongsTo content');
    assert.ok(!internal.values.posts.content, 'hasMany content');
    assert.ok(!internal.values.posts.value, 'hasMany value');

    assert.ok(internal.values.blog.destroyed);
    assert.ok(internal.values.posts.destroyed);
    assert.ok(internal.values.attachments.destroyed);
  });
});
