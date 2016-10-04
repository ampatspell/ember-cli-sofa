import Ember from 'ember';
import config from './config/environment';

const Router = Ember.Router.extend({
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('authors', function() {
    this.route('new', { path: '/new' });
    this.route('author', { path: ':author_id' }, function() {
      this.route('edit');
    });
  });
});

export default Router;
