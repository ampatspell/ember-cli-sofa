# TODO

* root collections
* model attachments
* per-database models (each database is initialized with model folder name which is returned by store.databaseOptionsForIdentifier)
* support cross-database model loads (`{ user: { database: 'users', _id: 'user:ampatspell' } }` and `user: belongsTo('user', { database: 'users' })`)
* embedded models (persisted as a `{ key: { model } }`)
* abstract Couch, have also PouchDB
* couch permissions
* couch session
* couch changes listener
* database session
* database permissions
* database changes -> push
