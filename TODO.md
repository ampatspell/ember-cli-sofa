# TODO

## sofa

### Relationship classes

* sortable relationship helper `Relationship.extend({ sortable: sortable('position') })`: needed?
* paginated relationship helper `Relationship.extend({ paginated: paginated(...) })`

### Collections

* consider droping collections and adding support for model relationships which are updated w/o inverse:

``` javascript
// models/session.js
export default Model.extend({
  sections: hasMany('section', { inverse: null, relationship: 'session-sections' })
});
```

``` javascript
// relationships/session-sections.js
export default Relationship.extend({

  // optional
  query: { name: 'view', ddoc: 'section', view: 'all' },

  root: computed('@each.{category,position}', function() {
    return this.filterBy('category', null).sortBy('position');
  }).readOnly(),

  visible: computed('root.@each.visible', function() {
    return this.get('root').filterBy('visible', true);
  }).readOnly(),

});
```

* query load results are not directly added to relationship
* relationship can have `matches` computed property
* relationship can have `{ modelName: null }`
* relationship should be destroyable, not only parent model


### changes

* on changes prop (`feed`, `view`, `...`) change `couch:database-changes` should be restarted
* on login, logout, Changes should be restarted. optionally (or better yet `autorun: 'authenticated', ...`)
* enable changes listener only after fastboot shoebox deserialize

### fastboot

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
