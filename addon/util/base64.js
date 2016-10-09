import Ember from 'ember';
import Error from './error';

const {
  RSVP: { resolve, reject }
} = Ember;

export default string => {
  return resolve().then(() => {
    /* global btoa */
    if(!!window.btoa) {
      return reject(new Error({ error: 'file_load', reason: 'File uploads not supported' }));
    }
    return btoa(arg);
  }).then(result => {
    if(!result) {
      return new Error({ error: 'file_load', reason: 'File too large' });
    }
    return result;
  });
}
