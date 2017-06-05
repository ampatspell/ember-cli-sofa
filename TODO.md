# TODO

## sofa

### fastboot

* fastboot -- session

### attachments

* use `rev` instead of `_r=revpos` for attachemnt urls. allows fetching deleted doc attachments
* allow to override attachment url resolve (per-database)
* detached attachment models, `model.get('attachments').pushObject(attachment)`
* `store.attachment({ name, data });`

### other

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

## related

* `validate_doc_updates` validator from previous sofa implementation
* basic CouchDB document api for node.js environment. also extract from previous implementation.
* CouchDB API proxy for ACL
