# TODO

* get rid of getWrappedContent() in has-many
* destroy isNew model -> model is removed from identity.new _and_ all assigned relationships
* root collections
* per-database models (each database is initialized with model folder name which is returned by store.databaseOptionsForIdentifier)
* embedded models (persisted as a `{ key: { model } }`)
* abstract Couch, have also PouchDB
* couch changes listener
* database changes -> push
* get rid of wrapFile nonsense. have a nice class and don't keep resolved promises there

# Done

* model-callbacks-test
* database-documents-test
* database-documents-attachments-test -> couch-documents-attachments-test
* properties-attribute-test
* properties-attribute-transform-test
* properties-attribute-transform-date-test
* properties-attribute-transform-float-test
* properties-attribute-transform-integer-test
* properties-attribute-transform-json-test
* properties-type-test
* model-inheritance-test
* support cross-database model loads (`{ user: { database: 'users', _id: 'user:ampatspell' } }`
* couch database tests from old impl
* couch mango indexes
* replace attachment
* model inheritance
