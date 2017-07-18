import Ember from 'ember';
import createStateMixin from './util/basic-state-mixin';
import { array } from './util/computed';

const {
  on,
  computed: { oneWay },
  RSVP: { reject },
  A
} = Ember;

const State = createStateMixin({
  onDirty: [ 'name', 'password' ]
});

export default Ember.Object.extend(State, Ember.Evented, {

  couch: null,
  documents: oneWay('couch.documents.session'),

  isAuthenticated: false,

  name: null,
  password: null,
  roles: array('roles'),

  _forwardEvents: on('init', function() {
    let documents = this.get('documents');
    documents.on('login', this, this._onDocumentsLogin);
    documents.on('logout', this, this._onDocumentsLogout);
  }),

  _registerOperation(name, promise) {
    return this.get('couch')._registerOperation(`session-${name}`, null, promise);
  },

  _onDocumentsLogin() {
    this.trigger('login');
  },

  _onDocumentsLogout() {
    this.trigger('logout');
  },

  restore() {
    this.__restore = this.__restore || this.load();
    return this.__restore;
  },

  load() {
    this.onLoading();
    return this._registerOperation('load', this.get('documents').load().then(data => {
      this.onLoaded(data.userCtx);
      return this;
    }, err => {
      this.onError(err);
      return reject(err);
    }));
  },

  _save() {
    this.onSaving();
    let { name, password } = this.getProperties('name', 'password');
    return this._registerOperation('save', this.get('documents').save(name, password).then(data => {
      this.onSaved(data);
      return this;
    }, err => {
      this.onSaveError(err);
      return reject(err);
    }));
  },

  save(name, password) {
    if(name && password) {
      this.setProperties({ name, password });
    }
    return this._save();
  },

  delete() {
    this.onSaving();
    return this._registerOperation('delete', this.get('documents').delete().then(() => {
      this.onDeleted();
      return this;
    }, err => {
      this.onError(err);
      return reject(err);
    }));
  },

  onDeleted() {
    this.onNew();
  },

  onSaved(data) {
    let name = this.get('name');
    this.onLoaded({ name, roles: data.roles });
  },

  onSaveError(err) {
    this.onLoaded();
    this.onError(err);
  },

  onNew() {
    this.setProperties({
      name: null,
      password: null,
      roles: A(),
      isAuthenticated: false,
    });
    this._super();
  },

  onLoaded(ctx) {
    ctx = ctx || {};
    this.setProperties({
      name: ctx.name || this.get('name'),
      password: null,
      roles: A(ctx.roles || []),
      isAuthenticated: !!ctx.name
    });
    this._super();
  },

  actions: {
    save() {
      return this.save(...arguments);
    },
    delete() {
      return this.delete();
    }
  }

});
