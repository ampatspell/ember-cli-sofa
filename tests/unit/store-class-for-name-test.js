import Ember from 'ember';
import { module, test, createStore, register } from '../helpers/setup';

const {
  getOwner
} = Ember;

let store;
let classes;

module('store-class-for-name', () => {
  store = createStore();
  classes = store.get('_classes');
});

test('instances has owner', assert => {
  let Class = Ember.Object.extend({ name: 'thing' });
  register('model:thing', Class);
  let fn = opts => {
    let Thing = store._classForName(opts);
    assert.ok(getOwner(Thing.create()));
    console.log(Thing.create()+'');
  };
  fn({ prefix: 'model', name: 'thing' });
  fn({ prefix: 'model', name: 'thing', variant: { name: 'nice' } });
  fn({ prefix: 'model', name: 'thing', factory: { ok: true }, variant: { name: 'nice' } });
});

test('base', assert => {
  let Class = Ember.Object.extend({ name: 'thing' });
  register('test:thing', Class);
  let Thing = store._classForName({ prefix: 'test', name: 'thing' });
  assert.ok(Thing);
  assert.equal(Thing.create().get('name'), 'thing');
  assert.ok(classes['test:thing'].class === Class);
  assert.ok(classes['sofa:test/thing'] === Thing);
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
  assert.ok(classes['sofa:test/thing'] === Thing);
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
  assert.ok(classes['sofa:test/thing']);
  assert.ok(classes['sofa:test/thing/cute'] === Thing);
});

test('base factory without opts', assert => {
  let factory = opts => Ember.Object.extend({ name: opts.name });
  register('test:thing', factory);
  let Thing = store._classForName({ prefix: 'test', name: 'thing' });
  assert.ok(Thing);
  assert.equal(Thing.create().get('name'), undefined);
  assert.ok(classes['sofa:test/thing'] === Thing);
});

test('base factory with opts', assert => {
  let factory = opts => Ember.Object.extend({ name: opts.name });
  register('test:thing', factory);
  let Thing = store._classForName({ prefix: 'test', name: 'thing', factory: { name: 'thing' }});
  assert.ok(Thing);
  assert.equal(Thing.create().get('name'), 'thing');
  assert.ok(classes['sofa:test/thing/{name=thing}']);
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
  assert.ok(classes['sofa:test/thing']);
  assert.ok(classes['sofa:test/thing/cute'] === Thing);
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
  assert.ok(classes['sofa:test/thing/{name=thing}']);
  assert.ok(classes['sofa:test/thing/{name=thing}/cute'] === Thing);
});

test('base is cached', assert => {
  let Class = Ember.Object.extend({ name: 'thing' });
  register('test:thing', Class);
  assert.ok(store._classForName({ prefix: 'test', name: 'thing' }) === store._classForName({ prefix: 'test', name: 'thing' }));
});

test('base factory is cached', assert => {
  let Class = () => Ember.Object.extend({ name: 'thing' });
  register('test:thing', Class);

  assert.ok(
    store._classForName({
      prefix: 'test',
      name: 'thing',
      factory: {
        name: 'foo'
      }
    })
    ===
    store._classForName({
      prefix: 'test',
      name: 'thing',
      factory: {
        name: 'foo'
      }
    })
  );

  assert.ok(
    store._classForName({
      prefix: 'test',
      name: 'thing',
      factory: {
        name: 'foo'
      }
    })
    !==
    store._classForName({
      prefix: 'test',
      name: 'thing'
    })
  );
});

test('variant class is cached', assert => {
  let Class = Ember.Object.extend({ name: 'thing' });
  register('test:thing', Class);

  assert.ok(store._classForName({
    prefix: 'test',
    name: 'thing',
    variant: {
      name: 'one',
      prepare: Thing => Thing.extend()
    }
  })
  ===
  store._classForName({
    prefix: 'test',
    name: 'thing',
    variant: {
      name: 'one',
      prepare: Thing => Thing.extend()
    }
  }));

  assert.ok(store._classForName({
    prefix: 'test',
    name: 'thing',
    variant: {
      name: 'one',
      prepare: Thing => Thing.extend()
    }
  })
  !==
  store._classForName({
    prefix: 'test',
    name: 'thing',
    variant: {
      name: 'two',
      prepare: Thing => Thing.extend()
    }
  }));
});


test('variant factory is cached', assert => {
  let Class = opts => Ember.Object.extend(opts);
  register('test:thing', Class);

  assert.ok(store._classForName({
    prefix: 'test',
    name: 'thing',
    factory: {
      name: 'thing'
    },
    variant: {
      name: 'one',
      prepare: Thing => Thing.extend()
    }
  })
  ===
  store._classForName({
    prefix: 'test',
    name: 'thing',
    factory: {
      name: 'thing'
    },
    variant: {
      name: 'one',
      prepare: Thing => Thing.extend()
    }
  }));

  assert.ok(store._classForName({
    prefix: 'test',
    name: 'thing',
    factory: {
      name: 'thing'
    },
    variant: {
      name: 'one',
      prepare: Thing => Thing.extend()
    }
  })
  !==
  store._classForName({
    prefix: 'test',
    name: 'thing',
    factory: {
    },
    variant: {
      name: 'one',
      prepare: Thing => Thing.extend()
    }
  }));

  assert.ok(store._classForName({
    prefix: 'test',
    name: 'thing',
    factory: {
      name: 'thing'
    },
    variant: {
      name: 'one',
      prepare: Thing => Thing.extend()
    }
  })
  !==
  store._classForName({
    prefix: 'test',
    name: 'thing',
    factory: {
      name: 'thing'
    },
    variant: {
      name: 'two',
      prepare: Thing => Thing.extend()
    }
  }));
});
