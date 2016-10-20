## Setup

> remove ember data

Easiest way to start using `sofa`, is by extending `Store` service:

``` javascript
// services/store.js
import { Store } from 'sofa';

const url = 'http://127.0.0.1:5984';

const mapping = {
  main: 'awesome-app',
  users: '_users'
};

export default Store.extend({

  databaseOptionsForIdentifier(identifier) {
    let name = mapping[identifier];
    if(!name) {
      return;
    }
    return { url, name };
  }

});
```

`sofa` supports multiple CouchDB hosts and databases (soon also PouchDB). Each database in application is accessed by
using `identifier`. To map identifiers to CouchDB database urls, override `databaseOptionsForIdentifier(identifier)`
and return `{ url, name }` object.

For example, if app queries `http://127.0.0.1:5984` `/awesome-app` and `/_users` CouchDB databases,
you can configure `Store` by using example above to refer to those databases by using `main` and `users` identifiers.

## Models

``` javascript
// models/section.js
import Ember from 'ember';
import { Model, prefix, attr, belongsTo } from 'sofa';
import makeid from '../util/make-id';

export default Model.extend({

  id: prefix(),

  position: attr('integer'),
  slug: attr('string'),
  visible: attr('boolean'),
  title: attr('string'),

  category: belongsTo('category', { inverse: 'sections' }),

  willCreate() {
    this.set('id', makeId(12));
    let now = new Date();
    this.setProperties({
      createdAt: now,
      updatedAt: now,
      slug: this.get('slugifiedTitle')
    });
  },

  willSave() {
    let now = new Date();
    this.setProperties({
      updatedAt: now,
      slug: this.get('slugifiedTitle')
    });
  }

});
```

``` javascript
// models/gallery.js
import Ember from 'ember';
import { prefix, type, attr, hasMany } from 'sofa';
import Section from './section';

export default Section.extend({

  id: prefix('section:'),
  type: type('section:gallery'),

  description: attr('string'),

  images: hasMany('gallery-image', { inverse: 'gallery', query: 'gallery-images' }),

});

```

* `prefix('section:')` -- saves gallery with `{ _id: "section:..." }`. Makes it easy to query all sections.

``` javascript
// models/gallery-image.js
import { Model, prefix, attr, belongsTo } from 'sofa';
import makeid from '../util/make-id';

export default Model.extend({

  id: prefix(),
  position: attr('integer'),
  filename: attr('string'),
  description: attr('string'),

  gallery: belongsTo('gallery', { inverse: 'images' }),

  willCreate() {
    let gallery = this.get('gallery.id');
    let id = makeid(12);
    this.set('id', `${gallery}:${id}`);
  }

});

```

* `prefix()` -- prefix document `_id` with model name (or `prefix('somethingElse')`)
* `type()` -- document `type` property which is used to determine `modelName` from document
* `attr()` -- basic attributes (string, date, integer, float, json, …)
* `belongsTo()` -- by default is persisted as a inverse `_id`, or can be queried if `query` is provided
* `hasMany()` -- by default is persisted as a `_id` array, or can be queried if `query` is provided

> Note: relationship inverses should be explictly defined if you want them to update

``` javascript
let db = store.get('db.main');
let gallery = db.model('gallery', { title: 'hello' });
return gallery.save().then(() => {
  let original = { name: 'original', data: fileOrBlobOrString };
  let image = db.model('gallery-image', { filename: 'foo', attachments: [ original ] });
  gallery.get('images').pushObject(image);
  image.get('gallery') // => gallery
  return image.save();
});
```

```javascript
let db = store.get('db.main');
db.first({ model: 'gallery', id: 'foof' }).then(gallery => {
  gallery.set('title', 'something');
  return gallery.save();
}).then(() => {
  return gallery.delete();
});
```

* db.model(modelName, props)
* db.existing(modelName, id, opts)
* db.load(modelName, id, opts)
* db.view(opts)
* db.mango(opts)
* db.all(opts)
* db.find(queryHash)
* db.first(queryHash)
* db.push(doc, opts)

## Queries

``` javascript
// queries/gallery-images.js
// It is used by models/gallery images hasMany relationship
import Ember from 'ember';
import { Query } from 'sofa';

const {
  computed
} = Ember;

export default Query.extend({

  find: computed('model.docId', function() {
    let key = this.get('model.docId');
    return { ddoc: 'gallery-image', view: 'by-gallery', key };
  })

});
```

``` javascript
// queries/sections.js
// used by collections/sections
import Ember from 'ember';
import { Query } from 'sofa';

const {
  computed
} = Ember;

export default Query.extend({

  find: computed(function() {
    return { ddoc: 'section', view: 'all' };
  })

});
```

> CouchDB Mango queries are also supported

## Collections

Collections are per-database live model arrays which can also be queried

``` javascript
// collections/sections.js
import Ember from 'ember';
import { Collection } from 'sofa';

export default Collection.extend({

  modelName: 'section',
  queryName: 'sections'

});
```

``` javascript
let db = this.get('store.db.main');
let sections = db.collection('sections');
sections.get('promise').then(() => {
  // loads collection query
});
```

## Session

``` javascript
let session = store.get('db.main.couch.session');

session.restore().then(() => {
  session.get('isAuthenticated'); // false
  session.setProperties({
    name: 'duck',
    password: 'yellow'
  });
  return session.save();
}).then(() => {
  session.get('isAuthenticated'); // true
  return session.delete();
}).then(() => {
  session.get('isAuthenticated'); // false
});
```

> sofa supports multiple CouchDB instances, each has it's own `couch` with `session`

## Raw documents

``` javascript
let docs = store.get('db.main.documents');
docs.info().then(json => {
  // { db_name: ... }
});
docs.save({ _id: '...' });
```

* couch.documents.{info, uuids}
* db.documents.{load, save, delete, view, mango...}
* db.documents.database.{info, create, recreate, }
* db.documents.design.{load, save}
