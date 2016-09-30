import Ember from 'ember';

const {
  merge
} = Ember;

function message(opts) {
  opts = opts || {};
  if(opts.status) {
    return `${opts.status} ${opts.error}: ${opts.reason}`;
  } else {
    if(opts.error || opts.reason) {
      return `${opts.error}: ${opts.reason}`;
    } else {
      return 'unknown sofa error';
    }
  }
}

export default function SofaError(opts) {
  Ember.Error.call(this, message(opts));
  merge(this, opts);
}

SofaError.prototype = Object.create(Ember.Error.prototype);

SofaError.prototype.toJSON = function() {
  let { status, error, reason } = this;

  let hash = {
    error,
    reason
  };

  if(status) {
    hash.status = status;
  }

  return hash;
};
