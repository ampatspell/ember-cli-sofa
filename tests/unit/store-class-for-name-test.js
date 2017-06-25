import Ember from 'ember';
import { module, test, createStore, register } from '../helpers/setup';

let store;
let classes;

module('store-class-for-name', () => {
  store = createStore();
  classes = store.get('_classes');
});

test('base', assert => {
  let Class = Ember.Object.extend({ name: 'thing' });
  register('test:thing', Class);
  let Thing = store._classForName({ prefix: 'test', name: 'thing' });
  assert.ok(Thing);
  assert.equal(Thing.create().get('name'), 'thing');
  assert.ok(classes['test:thing:-base'] === Thing);
});

test('base prepared', assert => {
  let Class = Ember.Object.extend();
  register('test:thing', Class);
  let Thing = store._classForName({
    prefix: 'test',
    name: 'thing',
    prepare: Thing => Thing.extend({ name: 'thing' })
  });
  assert.ok(Thing);
  assert.equal(Thing.create().get('name'), 'thing');
  assert.ok(classes['test:thing:-base'] === Thing);
});

test('variant prepared', assert => {
  let Class = Ember.Object.extend();
  register('test:thing', Class);
  let Thing = store._classForName({
    prefix: 'test',
    name: 'thing',
    prepare: Thing => Thing.extend({ name: 'thing' }),
    variant: {
      name: 'cute',
      prepare: Thing => Thing.extend({ variant: 'cute' })
    }
  });
  assert.ok(Thing);
  assert.equal(Thing.create().get('name'), 'thing');
  assert.equal(Thing.create().get('variant'), 'cute');
  assert.ok(classes['test:thing:-base']);
  assert.ok(classes['test:thing:cute'] === Thing);
});

test('base factory without opts', assert => {
  let factory = opts => Ember.Object.extend({ name: opts.name });
  register('test:thing', factory);
  let Thing = store._classForName({ prefix: 'test', name: 'thing' });
  assert.ok(Thing);
  assert.equal(Thing.create().get('name'), undefined);
  assert.ok(classes['test:thing:-base'] === Thing);
});

test('base factory with opts', assert => {
  let factory = opts => Ember.Object.extend({ name: opts.name });
  register('test:thing', factory);
  let Thing = store._classForName({ prefix: 'test', name: 'thing', factory: { name: 'thing' }});
  assert.ok(Thing);
  assert.equal(Thing.create().get('name'), 'thing');
  assert.ok(classes['test:thing:{"name":"thing"}:-base']);
});

test('variant factory without opts', assert => {
  let factory = opts => Ember.Object.extend({ name: opts.name });
  register('test:thing', factory);
  let Thing = store._classForName({
    prefix: 'test',
    name: 'thing',
    prepare: Thing => Thing,
    variant: {
      name: 'cute',
      prepare: Thing => Thing.extend({ variant: 'cute' })
    }
  });
  assert.ok(Thing);
  assert.equal(Thing.create().get('name'), undefined);
  assert.equal(Thing.create().get('variant'), 'cute');
  assert.ok(classes['test:thing:-base']);
  assert.ok(classes['test:thing:cute'] === Thing);
});

test('variant factory with opts', assert => {
  let factory = opts => Ember.Object.extend({ name: opts.name });
  register('test:thing', factory);
  let Thing = store._classForName({
    prefix: 'test',
    name: 'thing',
    factory: { name: 'thing' },
    prepare: Thing => Thing,
    variant: {
      name: 'cute',
      prepare: Thing => Thing.extend({ variant: 'cute' })
    }
  });
  assert.ok(Thing);
  assert.equal(Thing.create().get('name'), 'thing');
  assert.equal(Thing.create().get('variant'), 'cute');
  assert.ok(classes['test:thing:{"name":"thing"}:-base']);
  assert.ok(classes['test:thing:{"name":"thing"}:cute'] === Thing);
});
