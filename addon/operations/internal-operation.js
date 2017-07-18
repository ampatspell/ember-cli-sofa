import Ember from 'ember';

const {
  assert
} = Ember;

const noop = () => {};

export default class InternalOperation {

  constructor(owner, name, subject, promise) {
    assert(`promise is required`, promise);
    this.owner = owner;
    this.name = name;
    this.subject = subject;
    this.promise = promise;
    this.isDone = false;
  }

  set promise(promise) {
    assert(`promise already set`, !this._promise);
    this._promise = promise;
    this._done = this._promise.then(noop, noop).finally(() => this._setDone());
  }

  get promise() {
    return this._promise;
  }

  get done() {
    return this._done;
  }

  _setDone() {
    assert(`already done`, !this.isDone);
    this.isDone = true;
    this.owner._internalOperationDidFinish(this);
  }

}
