import Ember from 'ember';
import Changes from '../changes';
import Error from '../../util/error';

const {
  get,
  guidFor
} = Ember;

const DatabaseChanges = Changes.extend({

  toString() {
    return `<database-changes@${get(this.constructor, 'modelName')}::${guidFor(this)}>`;
  }

});

DatabaseChanges.reopenClass({

  create() {
    throw new Error({
      error: 'internal',
      reason: 'use `database.changes` to create new changes instances'
    });
  }

});

export default DatabaseChanges;
