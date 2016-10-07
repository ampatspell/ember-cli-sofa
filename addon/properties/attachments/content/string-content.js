import Ember from 'ember';
import { Content, internal } from './content';

const {
  computed
} = Ember;

export default Content.extend({

  data: internal('data'),

});
