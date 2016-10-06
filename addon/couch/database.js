import Ember from 'ember';
import SofaError from '../util/error';
import wrap from './util/file';
import { isFileOrBlob, hasToBase64, toBase64 } from './util/file-availability';

const {
  getOwner,
  computed,
  assert,
  merge,
  typeOf,
  RSVP: { resolve, reject, all },
  Logger: { warn }
} = Ember;

const stringifyUnlessEmpty = value => {
  let type = typeOf(value);
  if(type === 'null' || type === 'undefined') {
    return;
  }
  return JSON.stringify(value);
};

const lookup = name => {
  return computed(function() {
    return getOwner(this).lookup(name).create({ database: this });
  }).readOnly();
};

export default Ember.Object.extend({

  couch: null,
  name: null,

  security: lookup('couch:security'),
  design: lookup('couch:design'),

  url: computed('couch.url', 'name', function() {
    let url = this.get('couch.url');
    let name = this.get('name');

    let components = [];
    if(url) {
      if(url.endsWith('/')) {
        url = url.substring(0, url.length - 1);
      }
      components.push(url);
    }
    if(name) {
      components.push(name);
    }
    return components.join('/');
  }).readOnly(),

  request(opts) {
    opts = opts || {};
    let name = this.get('name');
    opts.url = opts.url ? `${encodeURIComponent(name)}/${opts.url}` : name;
    return this.get('couch').request(opts);
  },

  info() {
    return this.request({
      type: 'get',
      json: true
    }).then(null, null, 'sofa:database info');
  },

  load(id, opts) {
    assert(`id must be string not ${id}`, typeOf(id) === 'string');

    opts = merge({}, opts);

    return this.request({
      type: 'get',
      url: encodeURIComponent(id),
      qs: {
        rev: opts.rev,
      },
      json: true
    }).then(null, null, 'sofa:database load');
  },

  _loadFileAttachment(attachment, file) {
    file = wrap(file);
    attachment.content_type = file.contentType;
    return file.base64String();
  },

  _loadAttachment(attachment) {
    if(attachment.stub === true) {
      return false;
    } else {
      return resolve(attachment.data).then((data) => {
        let type = typeOf(data);
        if(isFileOrBlob(data)) {
          return this._loadFileAttachment(attachment, data);
        } else if(type === 'string') {
          if(!hasToBase64()) {
            return reject(new SofaError({ error: 'file_load', reason: 'File uploads not supported' }));
          }
          let string = toBase64(data);
          if(!string) {
            return reject(new SofaError({ error: 'file_load', reason: 'File too large' }));
          }
          return string;
        }
        return reject(new SofaError({ error: 'file_load', reason: `Unsupported file type '${type}'` }));
      }).then((data) => {
        attachment.data = data;
        return true;
      });
    }
  },

  _loadAttachments(doc) {
    let attachments = doc._attachments || {};
    var promises = [];
    for(let name in attachments) {
      let attachment = attachments[name];
      promises.push(this._loadAttachment(attachment));
    }
    return all(promises).then((results) => {
      return Ember.A(results).find((result) => {
        return result === true;
      });
    });
  },

  save(doc) {
    assert(`Document must be object not ${doc}`, typeOf(doc) === 'object');

    let scope = {};
    return resolve().then(() => {
      return this._loadAttachments(doc).then(has => { scope.attachments = has; });
    }).then(() => {
      let url;
      let type;

      if(doc._id) {
        type = 'put';
        url = encodeURIComponent(doc._id);
      } else {
        type = 'post';
      }

      return this.request({
        type: type,
        url: url,
        json: true,
        data: doc
      });
    }).then((data) => {
      if(scope.attachments) {
        data.reload = true;
      }
      return data;
    }, null, 'sofa:database save');
  },

  delete(id, rev) {
    assert(`id must be string not ${id}`, typeOf(id) === 'string');
    assert(`rev must be string not ${rev}`, typeOf(rev) === 'string');

    return this.request({
      type: 'delete',
      url: encodeURIComponent(id),
      qs: {
        rev: rev
      },
      json: true
    }).then(null, null, 'sofa:database delete document');
  },

  _view(url, opts) {
    opts = merge({}, opts);
    return this.request({
      type: 'get',
      url: url,
      json: true,
      qs: {
        key:              stringifyUnlessEmpty(opts.key),
        keys:             stringifyUnlessEmpty(opts.keys),
        start_key:        stringifyUnlessEmpty(opts.start_key),
        end_key:          stringifyUnlessEmpty(opts.end_key),
        startkey:         stringifyUnlessEmpty(opts.startkey),
        endkey:           stringifyUnlessEmpty(opts.endkey),
        include_docs:     opts.include_docs,
        start_key_doc_id: opts.start_key_doc_id,
        startkey_docid:   opts.startkey_docid,
        endkey_docid:     opts.endkey_docid,
        end_key_doc_id:   opts.end_key_doc_id,
        limit:            opts.limit,
        descending:       opts.descending,
        skip:             opts.skip,
        group:            opts.group,
        group_level:      opts.group_level,
        reduce:           opts.reduce,
        inclusive_end:    opts.inclusive_end,
      }
    }).then(null, null, 'sofa:database _view');
  },

  view(ddoc, name, opts) {
    assert(`ddoc must be string not ${ddoc}`, typeOf(ddoc) === 'string');
    assert(`name must be string not ${name}`, typeOf(name) === 'string');
    let url = `_design/${ddoc}/_view/${name}`;
    return this._view(url, opts).then(null, null, 'sofa:database view');
  },

  all(opts) {
    return this._view('_all_docs', opts).then(null, null, 'sofa:database all');
  },

  mango(opts) {
    opts = merge({}, opts);

    let explain = opts.explain;
    delete opts.explain;

    let url;
    if(explain) {
      url = '_explain';
    } else {
      url = '_find';
    }

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
        warn('CouchDB mango query:', results.warning, opts);
      }
      return results;
    }).then(null, null, 'sofa:database mango');
  }

});
