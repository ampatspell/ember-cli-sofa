import Ember from 'ember';

export default Ember.Object.extend({

  database: null,

  request(opts={}) {
    opts.url = '_security';
    return this.get('database').request(opts);
  },

  load() {
    return this.request({
      type: 'get',
      json: true
    });
  },

  save(data) {
    return this.request({
      type: 'put',
      json: true,
      data
    });
  }

});
