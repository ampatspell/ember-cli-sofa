import Ember from 'ember';
import createStateMixin from './util/basic-state-mixin';
import createForwardMixin from './operations/forward-register-operation';
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

const ForwardRegisterOperation = createForwardMixin('couch');

export default Ember.Object.extend(
  State,
  ForwardRegisterOperation,
  Ember.Evented, {

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
    let documents = this.get('documents');
    return this._registerOperation(documents.load().then(data => {
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
    let documents = this.get('documents');
    return this._registerOperation(documents.save(name, password).then(data => {
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
    let documents = this.get('documents');
    return this._registerOperation(documents.delete().then(() => {
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
