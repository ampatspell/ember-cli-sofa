import Ember from 'ember';
import createStateMixin from './util/basic-state-mixin';
import { lookup } from './util/computed';

const {
  computed: { oneWay }
} = Ember;

const State = createStateMixin();

const pair = key => {
  return lookup('sofa:database-security-pair', function() {
    return { key, security: this };
  });
};

export default Ember.Object.extend(State, {

  database: null,
  documents: oneWay('database.documents.security').readOnly(),

  admins:  pair('admins'),
  members: pair('members'),

  load() {
    this.onLoading();
    return this.get('documents').load().then((data) => {
      this.onLoaded(data);
      return this;
    }, (err) => {
      this.onError(err);
      return Ember.RSVP.reject(err);
    }, 'sofa:security load');
  },

  save() {
    if(!this.get('isDirty') && this.get('isLoaded')) {
      return Ember.RSVP.resolve(this, 'sofa:security save - not dirty');
    }

    this.onSaving();

    let data = this.serialize();
    return this.get('documents').save(data).then(() => {
      this.onSaved();
      return this;
    }, (err) => {
      this.onError(err);
      return Ember.RSVP.reject(err);
    }, 'sofa:security save');
  },

  onLoaded(data) {
    this.deserialize(data);
    this._super();
  },

  deserialize(data) {
    data = data || {};
    this.get("admins").deserialize(data.admins);
    this.get("members").deserialize(data.members);
  },

  serialize() {
    return {
      admins: this.get("admins").serialize(),
      members: this.get("members").serialize()
    };
  },

  clear() {
    this.deserialize();
  }

});
