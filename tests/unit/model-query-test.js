/* global emit */
import Ember from 'ember';
import { module, test, createStore, registerModels, cleanup, intercept } from '../helpers/setup';
import { Model, prefix, attr } from 'sofa';

const {
  RSVP: { resolve, all }
} = Ember;

let store;
let db;

let docs = [
  {
    _id: '_design/duck',
    views: {
      'by-name': {
        map: function(doc) {
          if(doc.type === 'duck') {
            emit(doc.name, null);
          }
        }.toString()
      }
    }
  },
  {
    _id: '_design/duck-mango',
    language: "query",
    views: {
      'type-and-name': {
        map: {
          fields: {
            type: 'asc',
            name: 'asc'
          }
        },
        reduce: '_count',
        options: {
          def: {
            fields: [ 'type', 'name' ]
          }
        }
      }
    }
  },
  {
    _id: 'duck:yellow',
    type: 'duck',
    name: 'yellow'
  },
  {
    _id: 'duck:green',
    type: 'duck',
    name: 'green'
  },
  {
    _id: 'duck:blue',
    type: 'duck',
    name: 'blue'
  },
  {
    _id: 'fish:red',
    type: 'fish',
    name: 'red'
  },
];

let Duck = Model.extend({
  id: prefix(),
  name: attr('string'),
});

let Fish = Model.extend({
  id: prefix(),
  name: attr('string'),
});

module('model-query', () => {
  registerModels({ Duck, Fish });
  store = createStore();
  db = store.get('db.main');
  db.set('modelNames', [ 'duck', 'fish' ]);
  return cleanup(store, [ 'main' ]).then(() => {
    return all(docs.map(doc => {
      return db.get('documents').save(doc);
    }));
  });
});

test('load view', assert => {
  return db.view({ ddoc: 'duck', view: 'by-name', key: 'yellow', model: 'duck' }).then(models => {
    assert.ok(models.length === 1);
    assert.ok(db.existing('duck', 'yellow') === models[0]);
    assert.ok(models[0].get('name') === 'yellow');
  });
});

test('load mango', assert => {
  return db.mango({ model: 'duck', selector: { type: 'duck', name: 'yellow' } }).then(models => {
    assert.ok(models.length === 1);
    assert.ok(db.existing('duck', 'yellow') === models[0]);
    assert.ok(models[0].get('name') === 'yellow');
  });
});

test('load all', assert => {
  return db.all({ model: 'duck', startkey: 'duck:', endkey: 'duck\uffff;' }).then(models => {
    assert.ok(models.length === 3);
    assert.deepEqual(models.mapBy('id'), [
      "blue",
      "green",
      "yellow"
    ]);
  });
});

test('load all with multiple models', assert => {
  return db.all({ optional: true }).then(models => {
    assert.ok(models.length === 4);
    assert.deepEqual(models.mapBy('id'), [
      "blue",
      "green",
      "yellow",
      "red"
    ]);
    assert.deepEqual(models.mapBy('modelName'), [
      "duck",
      "duck",
      "duck",
      "fish"
    ]);
  });
});

test('load by docId', assert => {
  return db.load(null, 'duck:yellow').then(model => {
    assert.ok(model.get('id'), 'yellow');
  });
});

test('find', assert => {
  let requests = intercept(db);
  return resolve().then(() => {
    return db.find({ id: 'duck:yellow' }).then(model => {
      assert.ok(model.get('id'), 'yellow');
    });
  }).then(() => {
    return db.find({ model: 'duck', id: 'yellow', force: true }).then(model => {
      assert.ok(model.get('id'), 'yellow');
    });
  }).then(() => {
    return db.find({ model: 'duck', key: 'duck:yellow', all: true }).then(arr => {
      assert.ok(arr.length === 1);
      assert.ok(arr[0].get('id'), 'yellow');
    });
  }).then(() => {
    return db.find({ model: 'duck', ddoc: 'duck', view: 'by-name', key: 'yellow' }).then(arr => {
      assert.ok(arr.length === 1);
      assert.ok(arr[0].get('id'), 'yellow');
    });
  }).then(() => {
    return db.find({ model: 'duck', selector: { name: 'yellow' } }).then(arr => {
      assert.ok(arr.length === 1);
      assert.ok(arr[0].get('id'), 'yellow');
    });
  }).then(() => {
    assert.deepEqual(requests, [
      {
        "json": true,
        "method": "get",
        "url": "duck%3Ayellow"
      },
      {
        "json": true,
        "method": "get",
        "url": "duck%3Ayellow"
      },
      {
        "json": true,
        "qs": {
          "include_docs": true,
          "key": "\"duck:yellow\""
        },
        "method": "get",
        "url": "_all_docs"
      },
      {
        "json": true,
        "qs": {
          "include_docs": true,
          "key": "\"yellow\""
        },
        "method": "get",
        "url": "_design/duck/_view/by-name"
      },
      {
        "body": {
          "selector": {
            "name": "yellow",
            "type": "duck"
          },
        },
        "json": true,
        "method": "post",
        "url": "_find"
      }
    ]);
  });
});

test('first', assert => {
  let requests = intercept(db);
  return resolve().then(() => {
    return db.first({ id: 'duck:yellow' }).then(model => {
      assert.ok(model.get('id'), 'yellow');
    });
  }).then(() => {
    return db.first({ model: 'duck', id: 'yellow', force: true }).then(model => {
      assert.ok(model.get('id'), 'yellow');
    });
  }).then(() => {
    return db.first({ model: 'duck', key: 'duck:yellow', all: true }).then(model => {
      assert.ok(model.get('id'), 'yellow');
    });
  }).then(() => {
    return db.first({ model: 'duck', ddoc: 'duck', view: 'by-name', key: 'yellow' }).then(model => {
      assert.ok(model.get('id'), 'yellow');
    });
  }).then(() => {
    return db.first({ model: 'duck', selector: { name: 'yellow' } }).then(model => {
      assert.ok(model.get('id'), 'yellow');
    });
  }).then(() => {
    assert.deepEqual(requests, [
      {
        "json": true,
        "method": "get",
        "url": "duck%3Ayellow"
      },
      {
        "json": true,
        "method": "get",
        "url": "duck%3Ayellow"
      },
      {
        "json": true,
        "qs": {
          "include_docs": true,
          "key": "\"duck:yellow\"",
          "limit": 1
        },
        "method": "get",
        "url": "_all_docs"
      },
      {
        "json": true,
        "qs": {
          "include_docs": true,
          "key": "\"yellow\"",
          "limit": 1
        },
        "method": "get",
        "url": "_design/duck/_view/by-name"
      },
      {
        "body": {
          "limit": 1,
          "selector": {
            "name": "yellow",
            "type": "duck"
          }
        },
        "json": true,
        "method": "post",
        "url": "_find"
      }
    ]);
  });
});
