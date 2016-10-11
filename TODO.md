# TODO

### sofa

* collection initial content
* load sections as a mango query (portfolio) doesnt match error
* load sections as ddoc without `model:...` -- docs dissapear somewhere for some reason
* collection modelName can also be base class. so can't compare using ===
* createdAt defaults to created_at key
* `collection.query`
* `model.save()`, `model.delete()`, ... second call while 1st is pending should return the same promise
* `hasMany('duck', { collection: 'barn-ducks' })` and `Collection.extend()` with `query: 'barn-ducks'` so there is a place for `paginated: ...`
* option to delete documents by saving with `_deleted:true`
* delete models with `type` property
* per-database models (each database is initialized with model folder name which is returned by `store.databaseOptionsForIdentifier`)
* embedded models (persisted as a `{ key: { model } }`)
* abstract Couch, have also PouchDB
* couch changes listener
* database changes -> push
* FastBoot support

### related

* `validate_doc_updates` validator from previous sofa implementation
* basic CouchDB document api for node.js environment. also extract from previous implementation.
* CouchDB API proxy for ACL
