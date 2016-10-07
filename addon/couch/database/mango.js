import Ember from 'ember';

const {
  merge,
  Logger: { warn }
} = Ember;

export default Ember.Object.extend({

  database: null,

  request(opts) {
    return this.get('database').request(opts);
  },

  reportWarning(warning, opts) {
    warn('CouchDB mango query:', warning, opts);
  },

  _query(url, opts) {
    opts = merge({}, opts);
    return this.request({
      type: 'post',
      url: url,
      json: true,
      data: {
        selector:  opts.selector,
        limit:     opts.limit,
        skip:      opts.skip,
        sort:      opts.sort,
        fields:    opts.fields,
        use_index: opts.use_index
      }
    }).then(results => {
      if(results.warning) {
        this.reportWarning(results.warning, opts);
      }
      return results;
    });
  },

  find(opts) {
    return this._query('_find', opts);
  },

  explain(opts) {
    return this._query('_explain', opts);
  }

});
