import Ember from 'ember';
import environment from '../config/environment';

const {
  name,
  version
} = environment.sofa;

let registered = false;

export default {
  name: 'sofa:version',
  after: 'sofa:internal',
  initialize() {
    if(registered) {
      return;
    }
    Ember.libraries.register(name, version);
    registered = true;
  }
};
