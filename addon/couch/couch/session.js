import Ember from 'ember';

const {
  RSVP: { reject }
} = Ember;

export default Ember.Object.extend(Ember.Evented, {

  couch: null,

  request(opts={}) {
    opts.url = '_session';
    return this.get('couch').request(opts);
  },

  load() {
    return this.request({
      type: 'get',
      json: true
    });
  },

  save(name, password) {
    return this.request({
      type: 'post',
      json: true,
      data: {
        name: name || "",
        password: password || ""
      }
    }).then(data => {
      this.trigger('login');
      return data;
    }, err => {
      this.trigger('logout');
      return reject(err);
    });
  },

  delete() {
    return this.request({
      type: 'delete',
      json: true,
    }).then(result => {
      this.trigger('logout');
      return result;
    });
  }

});
