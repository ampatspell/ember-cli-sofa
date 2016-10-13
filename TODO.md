# TODO

### sofa

* `hasMany.setValue(array)` allow reordering models
* `db.model('..', { attachments: [ { name, data: file } ] })` yields error loading
* replace `internal.isReady` with `next().then(() => { if(stillNeedsLoad) })` in internal model
* collection query autoload
* collection query needsReload
* `model.save()`, `model.delete()`, ... second call while 1st is pending should return the same promise
* `hasMany('duck', { collection: 'barn-ducks' })` and `Collection.extend()` with `query: 'barn-ducks'` so there is a place for `paginated: ...`
* detached attachment models, `model.get('attachments').pushObject(attachment)`
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
