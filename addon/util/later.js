import Ember from 'ember';

const {
  RSVP: { Promise },
  run: { later }
} = Ember;

export default function(delay) {
  return new Promise(resolve => {
    later(resolve, delay);
  });
}
