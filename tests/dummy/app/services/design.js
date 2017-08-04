import Ember from 'ember';

const {
  inject: { service },
  computed: { reads },
  RSVP: { all, reject },
  assign
} = Ember;

/* global emit */
const docs = [
  {
    id: 'main',
    views: {
      'all': {
        map(doc) {
          if(!doc.type) {
            return;
          }
          emit(doc._id, doc.type);
        }
      },
      'by-type': {
        map(doc) {
          if(!doc.type) {
            return;
          }
          emit(doc.type, doc._id);
        }
      }
    }
  },
  {
    id: 'authors',
    views: {
      'all': {
        map(doc) {
          if(doc.type !== 'author') {
            return;
          }
          emit(doc._id);
        }
      }
    }
  },
  {
    id: 'blogs',
    views: {
      'all': {
        map(doc) {
          if(doc.type !== 'blog') {
            return;
          }
          emit(doc._id);
        }
      },
      'by-author': {
        map(doc) {
          if(doc.type !== 'blog') {
            return;
          }
          if(!doc.authors) {
            return;
          }
          for(let i = 0; i < doc.authors.length; i++) {
            let author = doc.authors[i];
            emit(author);
          }
        }
      }
    }
  },
  {
    id: 'posts',
    views: {
      'all': {
        map(doc) {
          if(doc.type !== 'post') {
            return;
          }
          emit(doc._id);
        }
      },
      'by-author': {
        map(doc) {
          if(doc.type !== 'post') {
            return;
          }
          emit(doc.author);
        }
      }
    }
  },
  {
    id: 'images',
    views: {
      'all': {
        map(doc) {
          if(doc.type !== 'image') {
            return;
          }
          emit(doc._id);
        }
      }
    }
  }
];

export default Ember.Service.extend({

  store: service(),
  design: reads('store.db.main.documents.design').readOnly(),

  isBusy: false,
  result: null,
  error: null,

  _insert(doc) {
    doc = assign({}, doc);
    let id = doc.id;
    delete doc.id;
    return this.get('design').save(id, doc);
  },

  insert() {
    this.setProperties({ isBusy: true, result: null, error: null });
    return all(docs.map(doc => this._insert(doc))).then(result => {
      this.setProperties({ isBusy: false, result });
      return this;
    }, error => {
      this.setProperties({ isBusy: false, error });
      return reject(error);
    });
  }

});
