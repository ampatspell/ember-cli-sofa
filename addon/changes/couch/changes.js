import Ember from 'ember';
import Changes from '../changes';
import Error from '../../util/error';

const {
  get,
  guidFor
} = Ember;

const CouchChanges = Changes.extend({

  toString() {
    return `<couch-changes@${get(this.constructor, 'modelName')}::${guidFor(this)}>`;
  }

});

CouchChanges.reopenClass({

  create() {
    throw new Error({
      error: 'internal',
      reason: 'use `couch.changes` to create new changes instances'
    });
  }

});

export default CouchChanges;
