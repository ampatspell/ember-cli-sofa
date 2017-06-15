# TODO

## sofa

### fastboot

* fastboot -- session

### destroy

* check collection.destroy(), changes.destroy() and db.destroy() logic

### attachments

* allow to override attachment url resolve (per-database)
* use `rev` instead of `_r=revpos` for attachemnt urls. allows fetching deleted doc attachments
* detached attachment models, `model.get('attachments').pushObject(attachment)`
* `store.attachment({ name, data });`

### other

* loads from views or smth should check `internal.state.isLoaded && internal.rev === doc._rev`. if `true`, ignore update
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
* database changes -> push
* enable changes listener only after fastboot shoebox deserialize

## related

* basic CouchDB document api for node.js environment. extract from previous implementation.
* CouchDB API proxy for ACL
