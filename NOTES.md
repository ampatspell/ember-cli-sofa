## operations

* internal model loads, saves, deletes
* operations on multiple internal models
* operations w/o known/existing internal model

``` javascript
this.internalModelOperation(internalModel, 'operation name', () => {
  // return ...
});
```

* operations might have nested operations. (reload attachments after load for example)

``` javascript
class Operation {

  constructor(queue, tail, info, block) {
    this.queue = queue;
    this.tail = tail;
    this.info = info;
    this.block = block;
    this._promise = null;
  }

  __createPromise() {
    let join = cb => this.queue._joinOperation(cb);
    let tail = this.tail;
    return tail.finally(() => this._invokeBlock)
    return this.block(join);
  }

  _createPromise() {
    return this.__createPromise().finally(() => this.queue._operationDidFinish(this));
  }

  get promise() {
    if(!this._promise) {
      this._promise = this._createPromise();
    }
    // wait for queue to flush, invoke block
    return this._promise;
  }

}
```

``` javascript
export default (Owner, delegateKey) => class OperationQueueMixin extends Owner {

  constructor() {
    super(...arguments);
    this._operations = A();
    this._join = 0;
  }

  _tail() {
    let operations = this._operations;
    let len = operations.length;
    if(len === 0) {
      return resolve();
    }
    return operations[operations.length - 1];
  }

  _joinedTail() {
    let join = this._join > 0;
    if(join) {
      return resolve();
    }
    return this._tail();
  }

  get _operationQueueDelegate() {
    return this[delegateKey];
  }

  _createOperation(info, block) {
    let tail = this._joinedTail();
    let operation = new Operation(this, tail, info, block);
    this._operations.pushObject(operation);
    return operation;
  }

  _joinOperation(cb) {
    this._join++;
    let ret = cb();
    this._join--;
    return ret;
  }

  createOperation(info, block) {
    return this._createOperation(null, info, block);
  }

  _operationDidFinish(operation) {
    this._operations.removeObject(operation);
  }

}
```

``` javascript
_operation(target, info, block) {
  let op = target.queue.createOperation(info, block);
  return op.promise;
},

_internalModelOperation(internal, name, block) {
  return this._operation(internal, { name }, block);
},

_reloadInternalModel(internal) {
  return this._internalModelOperation(internal, 'reload', () => {
    return documents.load(docId);
  });
},

_loadInternalModel(internal, opts) {
  return this._internalModelOperation(internal, 'load', join => {
    return join(() => this._reloadInternalModel(internal));
  });
}
```

* `database` has a list of currently running operations
* `internalModel` has a fifo queue


queue
  1) load | running
      join adds ops
  2) reload | waiting
