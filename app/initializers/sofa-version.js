import Ember from 'ember';
import environment from '../config/environment';

const {
  name,
  version
} = environment.sofa;

export default {
  name: 'sofa:version',
  after: 'sofa:internal',
  initialize(container) {
    Ember.libraries.register(name, version);
  }
};
