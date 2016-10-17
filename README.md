# ember-cli-sofa

> This documentation is also available at http://sofa.amateurinmotion.com

`Sofa` is full featured and easy to use CouchDB persistence library for Ember.js.

## Install

```bash
ember install @ampatspell/ember-cli-sofa
```

## Setup

Easiest way to start using `sofa`, is by extending `Store` service:

``` javascript
// services/store.js
import { Store } from 'sofa';

const url = 'http://127.0.0.1:5984';

const mapping = {
  main: 'awesome-app',
  users: '_users'
};

export default Store.extend({

  databaseOptionsForIdentifier(identifier) {
    let name = mapping[identifier];
    if(!name) {
      return;
    }
    return { url, name };
  }

});
```

`sofa` supports multiple CouchDB hosts and databases (soon also PouchDB). Each database in application is accessed by
using `identifier`. To map identifiers to CouchDB database urls, override `databaseOptionsForIdentifier(identifier)`
and return `{ url, name }` object.

For example, if app queries `http://127.0.0.1:5984` `/awesome-app` and `/_users` CouchDB databases,
you can configure `Store` by using example above to refer to those databases by using `main` and `users` identifiers.

## Usage

..rest is coming
