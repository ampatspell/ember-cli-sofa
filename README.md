# ember-cli-sofa

> This documentation is also available at http://sofa.amateurinmotion.com

`Sofa` is full featured and easy to use CouchDB model persistence library for Ember.js.

It makes it easy to map CouchDB documents to application models, query and persist them, manage queriable to-one, to-many relationships and relationship inverses, create and load document attachments. Also create, drop databases, authenticate users by using CouchDB sessions, create and update design documents (javascript and mango views).

This is is one of the easiest ways to start coding your Ember.js app which persists data in the cloud. All you need is CouchDB running somewhere. You can also deploy Ember.js app itself as an CouchApp in the same CouchDB database and, with simple CouchDB and optionally nginx configuration, serve it to your users.

Both CouchDB 1.6 and 2.0 are supported.

While Sofa has already most of commonly required features implemented, there is quite a few things in the roadmap like:

* FastBoot support
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

## Model

### id
### rev
### type
### attachments
### save()
### load()
### reload()
### delete()
### willCreate()
### willSave()
### willDelete()

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
