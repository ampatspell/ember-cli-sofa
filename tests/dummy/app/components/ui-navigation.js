import Ember from 'ember';

const {
  inject: { service },
  computed,
  computed: { oneWay },
  merge
} = Ember;

const routes = [
  { title: 'index' },
  { title: 'authors' }
];

const Route = Ember.Object.extend({

  route: oneWay('title'),

  isCurrent: computed('router.currentRouteName', function() {
    return this.get('router.currentRouteName').indexOf(this.get('route')) === 0;
  }).readOnly(),

});

export default Ember.Component.extend({
  classNameBindings: [':ui-navigation'],

  router: service(),

  routes: computed(function() {
    let router = this.get('router');
    return Ember.A(Ember.A(routes).map(item => {
      return Route.create(merge({ router }, item));
    }));
  }),

  actions: {
    transition(item) {
      this.get('router').transitionTo(item.get('route'));
    }
  }

});
