# TODO

## sofa

### Relationship classes

* paginated relationship helper `Relationship.extend({ paginated: paginated(...) })`
* sortable relationship helper `Relationship.extend({ sortable: sortable('position') })`: needed?
* relationship with `query.find` embedded as `query`

### Collection relation

* collection relations should not set parent model dirty

### Query loader

* figure out how to improve this thing

### changes

* on changes prop (`feed`, `view`, `...`) change `couch:database-changes` should be restarted
* on login, logout, Changes should be restarted. optionally (or better yet `autorun: 'authenticated', ...`)
* enable changes listener only after fastboot shoebox deserialize

### fastboot

* serialize `isNew` models with docId -- include model `_state`
* do not autoload models and relationships in fastboot. but `relationshi[.get('isLoading')` should return `true` and update internal state

### attachments

* allow to override attachment url resolve (per-database)
* use `rev` instead of `_r=revpos` for attachemnt urls. allows fetching deleted doc attachments
* detached attachment models, `model.get('attachments').pushObject(attachment)`
* `store.attachment({ name, data });`
* attachment `data` as a Promise which must resolve to `Blob` or `String` (add scaled image)

### other

* is it possible to provide `promise` prop for `PassiveRelationLoaderStateMixin`?
* `model.save()`, `model.delete()`, ... second call while 1st is pending should return the same promise
* option to delete documents by saving with `_deleted:true` or delete with `{_deleted: true, type:..}`
* per-database models (each database is initialized with model folder name which is returned by `store.databaseOptionsForIdentifier`)
* embedded models (persisted as a `{ key: { model } }`)

## related

* basic CouchDB document api for node.js environment. extract from previous implementation.
* CouchDB API proxy for ACL
