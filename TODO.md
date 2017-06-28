# TODO

## sofa

### Model

* transient models with generated ids for shoebox

``` javascript
// models/session.js
import { Model, hasMany } from 'sofa';

export default Model.extend({

  ducks: hasMany('duck', { inverse: null, relationship: 'session-ducks' })

});
```

``` javascript
let session = db.transient('session', 'singleton');
  // db.existing('session', 'signleton', { create: true });
  // and internal.transient = true

session.get('state.isLoaded') // => true
session.get('state.isNew') // => false
session.save() // => rejects with { error: 'transient', reason: 'transient models cannot be saved' }
```

``` javascript
session.serialize('shoebox') // =>
// { _id: 'singleton', type: 'session', ducks: { isLoaded: true }}
```

``` javascript
let model = db.push({
  _id: 'singleton',
  type: 'session',
  ducks: {
    isLoaded: true
  }
}).get();

model.get('state.isLoaded') // => true
```

### Query

* figure out what context properties are needed, provide those

### Relationship classes

* sortable relationship helper `Relationship.extend({ sortable: sortable('position') })`: needed?
* paginated relationship helper `Relationship.extend({ paginated: paginated(...) })`

### Collection relation

* belongsTo with `{ inverse: null }`

### changes

* on changes prop (`feed`, `view`, `...`) change `couch:database-changes` should be restarted
* on login, logout, Changes should be restarted. optionally (or better yet `autorun: 'authenticated', ...`)
* enable changes listener only after fastboot shoebox deserialize

### fastboot

* serialize `isNew` models -- include model `_state`
* push and retrieve session state from shoebox
  // https://simplabs.com/blog/2016/12/06/out-of-the-box-fastboot-support-in-ember-simple-auth.html
  // implementation might go to ember-cli-couch
* database urls in fastboot v.s. browser (might use `fastboot.request.host`)

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
