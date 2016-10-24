# TODO

### sofa

* `serialize` & deserialize instead of `preview` use `type` (`preview`, `document`, `shoebox|serialized`)
* fastboot -- mark model proxy relationships as loaded, mark collections as loaded
* detached attachment models, `model.get('attachments').pushObject(attachment)`
* `store.attachment({ name, data });`
* `hasMany.length` should start loading
* is it possible to provide `promise` prop for `PassiveRelationLoaderStateMixin`?
* attachment `data` as a Promise which must resolve to `Blob` or `String` (add scaled image)
* `Relationship` and `hasMany({ relationship: 'foobar' })`
* sortable relationship helper `Relationship.extend({ sortable: sortable('position') })`
* `model.save()`, `model.delete()`, ... second call while 1st is pending should return the same promise
* `hasMany('duck', { collection: 'barn-ducks' })` and `Collection.extend()` with `query: 'barn-ducks'` so there is a place for `paginated: ...`
* option to delete documents by saving with `_deleted:true`
* delete models with `type` property
* per-database models (each database is initialized with model folder name which is returned by `store.databaseOptionsForIdentifier`)
* embedded models (persisted as a `{ key: { model } }`)
* abstract Couch, have also PouchDB
* couch changes listener
* database changes -> push

### related

* `validate_doc_updates` validator from previous sofa implementation
* basic CouchDB document api for node.js environment. also extract from previous implementation.
* CouchDB API proxy for ACL
