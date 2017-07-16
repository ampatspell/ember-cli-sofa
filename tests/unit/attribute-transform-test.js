import { configurations, registerModels, cleanup } from '../helpers/setup';
import { Model, attr } from 'sofa';

configurations({ only: '1.6' }, ({ module, test, createStore }) => {

  let store;
  let db;

  let TestDuck = Model.extend({
    name: attr('string'),
    email: attr('string'),
    info: attr(),
    date: attr('date'),
  });

  module('attribute-transform', () => {
    registerModels({ TestDuck });
    store = createStore();
    db = store.get('db.main');
    return cleanup(store, [ 'main' ]);
  });

  test('transforms are singleton', assert => {
    let model = db.model('test-duck');
    let name = model.get('_internal').getProperty('name').transform();
    let email = model.get('_internal').getProperty('email').transform();
    assert.ok(name === email);
  });

  test('identifier is a special case', assert => {
    let model = db.model('test-duck', { id: null });
    assert.ok(model.get('id') === undefined);
    model.set('id', null);
    assert.ok(model.get('id') === undefined);
    model.set('id', 1);
    assert.ok(model.get('id') === '1');
  });

  test('rev is a special case', assert => {
    let model = db.model('test-duck', { rev: null });
    assert.ok(model.get('rev') === undefined);
    model.set('rev', null);
    assert.ok(model.get('rev') === undefined);
    model.set('rev', 1);
    assert.ok(model.get('rev') === '1');
  });

  test('number is transformed to string', assert => {
    let model = db.model('test-duck');
    assert.ok(model.get('id') === undefined);
    model.set('name', 1);
    assert.ok(model.get('name') === '1');
  });

  test('date string is transformed to Date', assert => {
    let model = db.model('test-duck');

    let date = new Date();
    model.set('date', date.toJSON());
    assert.ok(model.get('date') instanceof Date);
    assert.equal(model.get('date').toJSON(), date.toJSON());

    model.set('date', 'asd');
    assert.ok(model.get('date') === null);

    model.set('date', new Date('asd'));
    assert.ok(model.get('date') === null);

    model.set('date', date);
    assert.equal(model.serialize().date, date.toJSON());
  });

  test('date is transformed on init', assert => {
    let date = new Date();
    let model = db.model('test-duck', { date: date.toJSON() });
    assert.ok(model.get('date').toJSON() === date.toJSON());
  });

  test('props are serialized and deserialized', assert => {
    let date = new Date();
    let model = db.model('test-duck', { id: 'one', date: date, name: 1, email: ['a', 'b'], info: { ok: true } });
    return model.save().then(() => {
      return db.get('documents').load('one');
    }).then(doc => {
      assert.deepEqual_({
        "_id": "one",
        "_rev": "ignored",
        "date": date.toJSON(),
        "email": "a,b",
        "info": {
          "ok": true
        },
        "name": "1",
        "type": "test-duck"
      }, doc);

      return db.get('documents').save({
        _id: 'one',
        _rev: doc._rev,
        type: 'test-duck',
        date: 'hello',
        email: ['a', 'b'],
        info: { ok: true }
      });
    }).then(() => {
      return db.load('test-duck', 'one', { force: true });
    }).then(model => {
      assert.ok(model.get('date') === null, model.get('date'));
      assert.ok(model.get('email') === 'a,b');
      assert.deepEqual(model.get('info'), { ok: true });
    });
  });

  test('date is deserialized', assert => {
    let date = new Date();
    let model = db.model('test-duck', { id: 'one', date: date });
    return model.save().then(() => {
      return db.load('test-duck', 'one');
    }).then((model) => {
      assert.ok(model.get('date').toJSON() === date.toJSON());
    });
  });

});
