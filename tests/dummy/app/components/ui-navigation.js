import Ember from 'ember';

const {
  computed,
  getOwner,
  computed: { oneWay },
  merge
} = Ember;

const routes = [
  { title: 'index', route: 'index' },
  { title: 'about', route: 'about' }
];

const Route = Ember.Object.extend({

  isCurrent: computed('router.currentRouteName', function() {
    return this.get('router.currentRouteName').indexOf(this.get('route')) === 0;
  }).readOnly(),

});

export default Ember.Component.extend({
  classNameBindings: [':ui-navigation'],

  router: computed(function() {
    return getOwner(this).lookup('router:main');
  }),

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
