import Ember from 'ember';

const {
  on
} = Ember;

export default Ember.Mixin.create({

  _proxyInitialized: on('init', function() {
    this._isProxyInitialized = true;
  })

});
