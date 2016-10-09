# ember-cli-sofa

> This documentation is also available at http://sofa.amateurinmotion.com

`Sofa` is full featured and easy to use CouchDB persistence addon for Ember.js.

## Install

```bash
ember install @ampatspell/ember-cli-sofa
```

Full documentation coming soon.

For now just some random examples.

``` javascript
// models/author.js
import { Model, prefix, attr, hasMany, belongsTo } from 'sofa';

export default Model.extend({

  id: prefix(),
  name: attr('string'),
  email: attr('string'),

  blogs: hasMany('blog', { inverse: 'authors', query: 'author-blogs' }),
  posts: hasMany('post', { inverse: 'author', persist: false }),

  post: belongsTo('post', { query: 'author-first-post' }),

  willCreate() {
    let name = this.get('name');
    if(!name) {
      name = 'unnamed';
    }
    let id = name.trim().toLowerCase();
    this.set('id', id);
  }

});
```

``` javascript
// models/blog.js
import { Model, prefix, attr, hasMany } from 'sofa';

export default Model.extend({

  id: prefix(),
  name: attr('string'),

  authors: hasMany('author', { inverse: 'blogs' })

});
```

``` javascript
// models/post.js
import { Model, prefix, attr, belongsTo } from 'sofa';
import { makeid } from '../util/makeid';

export default Model.extend({

  id: prefix(),
  title: attr('string'),
  body: attr('string'),

  author: belongsTo('author', { inverse: 'posts' }),

  willCreate() {
    this.set('id', makeid());
  }

});
```

``` javascript
// queries/autor-blogs.js
import Ember from 'ember';
import { Query } from 'sofa';

const {
  computed
} = Ember;

export default Query.extend({

  find: computed('model.docId', function() {
    let author = this.get('model.docId');
    return {
      selector: {
        authors: {
          $elemMatch: {
            $eq: author
          }
        }
      }
    };
  }),

});
```

``` javascript
// collections/authors.js
import { Collection } from 'sofa';

export default Collection.extend({

  modelName: 'author',

});

```

``` javascript
let db = this.get('store.db.main');
db.find({ model: 'author', selector: {} }) // => loads all authors

// create new author
let author = db.model('author', { name: 'Kurt' });
author.save().then(() => {
  ...
});

db.first({ model: 'blog' }).then(blog => {
  blog.set('author', author);
  author.get('blogs.firstObject'); // => blog
});

db.collection('authors'); // => live-updating array of all loaded authors
```
