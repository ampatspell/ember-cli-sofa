# ember-cli-sofa

> This documentation is also available at http://sofa.amateurinmotion.com

`Sofa` is full featured and easy to use CouchDB model persistence library for Ember.js.

It makes it easy to map CouchDB documents to application models, query and persist them, manage queriable to-one, to-many relationships and relationship inverses, create and load document attachments. Also create, drop databases, authenticate users by using CouchDB sessions, create and update design documents (javascript and mango views).

This is is one of the easiest ways to start coding your Ember.js app which persists data in the cloud. All you need is CouchDB running somewhere. You can also deploy Ember.js app itself as an CouchApp in the same CouchDB database and, with simple CouchDB and optionally nginx configuration, serve it to your users.

Both CouchDB 1.6 and 2.0 are supported.

While Sofa has already most of commonly required features implemented, there is quite a few things in the roadmap like:

* collection and relationship pagination, search, filtering support
* local PouchDB support
* document changes listener for local PouchDB and remote CouchDB instances
* per-database model name to document type mapping, embedded models and so on

## Example applications

* [Portfolio](https://github.com/ampatspell/portfolio) – Photography portfolio app (which showcases model inheritance, attachments, relationships, queries, collections)

## Install

```bash
ember install ember-cli-sofa
```

## Quickstart

This section will guide you through sofa configuration and most common features.

Let's start with setting it up.

### Service

> Be sure to remove `ember-data` addon from your `package.json` as Ember Data also registers `store` service and those two will clash. Or just name your sofa service differently.

Easiest way to start using sofa is to create a `store` service by extending `Store`:

``` javascript
// services/store.js
import { Store } from 'sofa';

export default Store.extend({

  databaseOptionsForIdentifier(identifier) {
    let url = 'http://127.0.0.1:5984';
    if(identifier === 'main') {
      return { url, name: 'great-app' };
    }
  }

});
```

The only required override is `databaseOptionsForIdentifier` which is used to determine CouchDB `url` and database `name` for given database `identifier`. This is done because this way actual database `url` and `name` is detached from database `identifier` which is used throughout the application and can be easily changed based on environment and deployment configuration.

Now we have a service, let's declare a global `store` variable and try it out in the console:

``` javascript
// instance-initializers/sofa-develop.js
export default {
  name: 'sofa:develop',
  initialize(app) {
    window.store = app.lookup('service:store');
    window.log = console.log.bind(console);
    window.err = err => console.error(err.toJSON ? err.toJSON() : err.stack);
  }
};
```

### Console

Let's start by logging in as an CouchDB `_admin`. This might come in handy if database does not exist. Open your browser's console and type this thing in:

``` javascript
store.get('db.main.couch.documents.session').save('<admin>', '<password>').then(log, err)
// → {ok: true, name: ...}
```

Now let's make sure that `main` database exists:

``` javascript
store.get('db.main.documents.database').info().then(log, err)
// depending if database actually exists:
//  → {db_name: "great-app", ... }
//  → {error: "not_found", reason: "Database does not exist.", status: 404}
```

So, if database doesn't exist, we can easily create it by calling `create()`:

``` javascript
store.get('db.main.documents.database').create().then(log, err)
// → {ok: true}
```

Good, now that we have created the database and it's time to start filling it up with some random documents.

For now reason, let's save a doc:

``` javascript
store.get('db.main.documents').save({
  _id: 'first',
  message: 'To whom it may concern: It is springtime. It is late afternoon.',
  author: 'Kurt Vonnegut'
}).then(log, err)
// → {ok: true, id: "first", rev: "1-8ed895a12ea8c1389116bcbaff0b7262"}
```

Load the same doc:

``` javascript
store.get('db.main.documents').load('first').then(log, err)
// → {
//     _id: "first",
//     _rev: "1-8ed895a12ea8c1389116bcbaff0b7262",
//     message: "To whom it may concern: It is springtime. It is late afternoon.",
//     author: "Kurt Vonnegut"
//   }
```

And delete it:

``` javascript
store.get('db.main.documents').delete('first', '1-8ed895a12ea8c1389116bcbaff0b7262').then(log, err)
// → {ok: true, id: "first", rev: "2-39d1e13f087a31499c222f8c4657fdb1"}
```

Easy enough, right? See JSON.* sections below for overview about raw CouchDB JSON API wrappers.

But now it's time to create a model class and let sofa manage all the document saving, loading, querying details.

### Models

In previous section we where playing with a document which had `message` and `author`, let's reimplement the same by using two models: `Message` and `Author`.

``` javascript
// models/message.js
import { Model, attr, belongsTo } from 'sofa';

export default Model.extend({

  text: attr('string'),
  author: belongsTo('author', { inverse: 'messages' }),

});
```

``` javascript
// models/author.js
import { Model, attr, hasMany } from 'sofa';

export default Model.extend({

  fullName: attr('string'),
  messages: hasMany('message', { inverse: 'author', query: 'author-messages' }),

});
```

``` javascript
// queries/author-messages.js
import Ember from 'ember';
import { Query } from 'sofa';

const {
  computed
} = Ember;

export default Query.extend({

  find: computed('model.docId', function() {
    let author = this.get('model.docId');

    // mango
    // return { selector: { author } } };

    // ddoc
    return { ddoc: 'message', view: 'by-author', key: author };
  }),

});
```

``` javascript
// sofa/databases/main.js
/* global emit */
import Ember from 'ember';
import { Database } from 'sofa';

const {
  RSVP: { all, resolve }
} = Ember;

const message = {
  views: {
    'by-author': {
      map(doc) {
        if(doc.type !== 'message') {
          return;
        }
        emit(doc.author, null);
      }
    }
  }
};

export default Database.extend({

  loginIfNeeded(name, password) {
    if(!name) {
      return resolve();
    }
    let session = this.get('couch.session');
    session.setProperties({ name, password });
    return session.save();
  },

  // provide `_admin` name and password if needed
  insertDesignDocuments(name, password) {
    return this.loginIfNeeded(name, password).then(() => {
      let design = this.get('documents.design');
      return all([
        design.save('message', message)
      ]);
    });
  }

});
```

``` javascript
store.get('db.main').insertDesignDocuments('duck', 'secret duck').then(log, err);
// → [ {ok: true, id: "_design/message", rev: "1-58d85750a59785112252278496836757", saved: true} ]
```

> Note: we will be saving documents with CouchDB auto-generated _id which may differ

``` javascript
db = store.get('db.main');

author = db.model('author', { fullName: 'Kurt Vonnegut' });

author.getProperties('id', 'isNew', 'isDirty')
// → {id: undefined, isNew: true, isDirty: true}

author.save();

author.getProperties('id', 'isNew', 'isDirty')
// → {id: "930c5583a5c3693a71cd3d6aba1b32c7", isNew: false, isDirty: false}

message = db.model('message', { author, text: 'To whom it may concern: It is springtime. It is late afternoon.' });

author.get('messages.firstObject') === message;
// → true

message.save();
message.getProperties('id', 'isNew', 'isDirty')
// → {id: "930c5583a5c3693a71cd3d6aba1b34a4", isNew: false, isDirty: false}
```

And reload the browser so there is no cached models in sofa store

``` javascript
db = store.get('db.main');

db.load('author', '930c5583a5c3693a71cd3d6aba1b32c7').then(author => window.author = author)
author.get('messages.isLoaded') // this kicks off the query load
// → false
// XHR finished loading: GET "http://127.0.0.1:5984/great-app/_design/message/_view/by-author?key=%22930c5…
author.get('messages.isLoaded')
// → true

message = author.get('messages.firstObject')
message.get('text')
// → "To whom it may concern: It is springtime. It is late afternoon."
message.get('author') === author
// → true
```


## Model

### id
### rev
### type
### attachments
### docId
### modelName
### database
### state

* isNew
* isLoading
* isLoaded
* isDirty
* isSaving
* isDeleted
* isError
* error

### serialize()
### save()
### load()
### reload()
### delete()
### willCreate()
### willSave()
### willDelete()

## Model Properties

### attributes

### id
### prefix
### rev
### type
### attr

### attachments

### relationships

### belongsTo & hasOne

### hasMany

## BelongsTo Loaded Proxy

### state
### isLoading
### isLoaded
### isError
### error
### promise

## HasMany Loaded Proxy

### state
### isLoading
### isLoaded
### isError
### error
### promise

## HasMany Persisted Proxy

### state
### isLoading
### isError
### error

## Collection

...

## Query

...

## Store

### database(identifier) → Store.Database
### databaseOptionsForIdentifier(identifier)
### modelClassForName(modelName) → Model class
### modelNames → [ String, ... ]
### model(modelName, props) → Model

## Store.Database

### identifier → String
### store → Store
### couch → Couch
### documents → JSON.Database
### collection(name, opts) → Collection
### modelClassForName(modelName) → Model class
### model(modelName, props) → Model
### existing(modelName, id, opts) → Model
### load(modelName, id, opts) → Promise - Model
### view(opts) → Promise - [ Model, ... ]
### mango(opts) → Promise - [ Model, ... ]
### all(opts) → Promise - [ Model, ... ]
### find(opts) → Promise - [ Model, ... ]
### first(opts) → Promise - [ Model, ... ]
### push(doc, opts) → Model, status or undefined
### security → Store.Database.Security
### db → Store.Databases

``` javascript
let main = store.get('db.main');
```

## Store.Couch

### documents → JSON.Couch
### url → String
### session → Store.Couch.Session

## Store.Database.Security

### database → Store.Database
### documents → JSON.Database.Security
### admins → Security.Pair
### members → Security.Pair
### load() →
### save() →
### clear()
### state → Object

* isLoading
* isLoaded
* isDirty
* isSaving
* isError
* error

## Security.Pair

### security →
### key → String
### names → [ String, ... ]
### roles → [ String, ... ]

## Store.Couch.Session

### couch → Store.Couch
### documents → JSON.Couch.Session
### isAuthenticated → boolean
### name → String
### password → String
### roles → [ String, ... ]
### restore() → Promise
### load() → Promise
### save() → Proise
### delete() → Promise
### state → Object

* isLoading
* isLoaded
* isDirty
* isSaving
* isError
* error

## JSON.Couch

### url
### normalizedUrl
### session
### request(opts)
### info()
### uuids(count)
### database(name)

## JSON.Couch.Session

### couch
### request(opts)
### load()
### save(name, password)
### delete()

## JSON.Database

### couch
### name
### security
### design
### database
### mango
### url
### request(opts)
### info()
### load(id, opts)
### save(doc, opts)
### delete(id, rev, opts)
### view(ddoc, name, opts)
### all(opts)

## JSON.Database.Design

### database
### id(name)
### load(name, opts)
### save(name, object)
### delete(name, opts)

## JSON.Database.Security

### database
### request(opts)
### load()
### save(object)

## JSON.Database.Database

### database
### request(opts)
### info()
### create(opts)
### delete(opts)
### recreate(opts)

## JSON.Database.Mango

### database
### request(opts)
### find(opts)
### explain(opts)
### save(ddoc, name, index)
### delete(ddoc, name)
### all()
