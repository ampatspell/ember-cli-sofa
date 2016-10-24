# Changes

``` plain
Version: {{version}}
```

### 2.0.0-pre.27

* [new] Basic FastBoot support including shoebox (Note: proxies are still reloaded in client)

### 2.0.0-pre.26

* [new] `{ polymorphic: true }` option for relationships which saves-loads relationships as a `{ id: docId, type: modelName }` objects

### 2.0.0-pre.17

* [new] export `Error` in `sofa/index.js`
* [fix] got rid of `isReady`. postpone load until next runloop and make sure load is still needed

### 2.0.0-pre.16

* [fix] do not attempt to load model before it is finished deserializing (`internal.isReady`)

### 2.0.0-pre.15

* [new] loadable `Collection` (`promise` only for now, no autoload)

### 2.0.0-pre.14

* [change] default to underscored property keys (`createdAt` -> `created_at` in doc)
* [fix] Collection `modelName` comparator now takes into account model inheritance
* [new] allow overriding `Database` by identifier (`sofa/database/main.js`)
* [new] allow overriding `Session` (`sofa/session.js`)

### 2.0.0-pre.13

* [new] Support linked documents in view queries
* [change] `db.find` defaults to `{ optional: true }`
* [fix] base64 encoding issue resolved for string attachments

### 2.0.0-pre.12

* [new] Register sofa in `Ember.libraries`

### 2.0.0-pre.10

* [new] Collection
