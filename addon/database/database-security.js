import Ember from 'ember';
import { lookup } from '../util/computed';

const security = function() {
  return lookup('sofa:database-security', function() {
    return { database: this };
  });
};

export default Ember.Mixin.create({

  security: security(),

  _destroySecurity() {
    this.get('security').destroy();
  }

});
