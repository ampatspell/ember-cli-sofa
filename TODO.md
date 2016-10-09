# TODO

### sofa

* `collection.query`
* `model.save()`, `model.delete()`, ... second call while 1st is pending should return the same promise
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
