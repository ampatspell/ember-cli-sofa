# Changes

``` plain
Version: {{version}}
```

### 2.0.4

* [new] Ember 2.13.3

### 2.0.3

* [new] `Relationship` classes
* [new] `Query` factories
* [new] Relationship properties are now created on model definition creation
* [fix] `database.destroy()` now destroys collections

### 2.0.2

* [fix] fastboot initializer compatibility with the latest `ember-cli-fastboot`

### 2.0.1

* [new] use `ember-fetch` instead of `ember-network`. works in fastboot

### 2.0.0

* [new] database `_changes` listeners
* [new] couch `_db_updates` listeners

### 2.0.0-pre.39

* [fix] `isDeleted` propogation fixed

### 2.0.0-pre.38

* [new] allow overriding per-database attachments, attachment classes. recreate them if model database is set separately from model creation

### 2.0.0-pre.37

* [new] allow overriding attachment content classes (per-database)

### 2.0.0-pre.35

* [new] extracted `ember-cli-couch` from codebase
* [new] keep deleted model `rev`, don't serialize it on next save
* [fix] remove stub attachments on deleted model saves
* [new] collections are now has identity by name and serialized opts `db.collection('foo') === db.collection('foo')`
* [new] fastboot shoebox now includes models, relations with load status and collections

### 2.0.0-pre.28

* [fix] couch request `{ json: false }` support

### 2.0.0-pre.27

* [new] Basic FastBoot support including shoebox (Note: proxies are still reloaded in client)

### 2.0.0-pre.26

* [new] `{ polymorphic: true }` option for relationships which saves-loads relationships as a `{ id: docId, type: modelName }` objects

### 2.0.0-pre.17

* [new] export `Error` in `sofa/index.js`
* [fix] got rid of `isReady`. postpone load until next runloop and make sure load is still needed

### 2.0.0-pre.16

* [fix] do not attempt to load model before it is finished deserializing (`internal.isReady`)

### 2.0.0-pre.15

* [new] loadable `Collection` (`promise` only for now, no autoload)

### 2.0.0-pre.14

* [change] default to underscored property keys (`createdAt` -> `created_at` in doc)
* [fix] Collection `modelName` comparator now takes into account model inheritance
* [new] allow overriding `Database` by identifier (`sofa/database/main.js`)
* [new] allow overriding `Session` (`sofa/session.js`)

### 2.0.0-pre.13

* [new] Support linked documents in view queries
* [change] `db.find` defaults to `{ optional: true }`
* [fix] base64 encoding issue resolved for string attachments

### 2.0.0-pre.12

* [new] Register sofa in `Ember.libraries`

### 2.0.0-pre.10

* [new] Collection
