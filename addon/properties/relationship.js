import Ember from 'ember';
import Property from './property';

const {
  merge
} = Ember;

export default class Relationship extends Property {

  constructor(relationshipModelName, opts) {
    super(merge({ relationshipModelName }, opts));
  }

}
