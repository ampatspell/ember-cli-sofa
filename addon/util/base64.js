import Ember from 'ember';
import blobutil from 'sofa/blob-util';

const {
  RSVP: { resolve }
} = Ember;

export default string => {
  return resolve().then(() => {
    let blob = blobutil.createBlob([ string ]);
    return blobutil.blobToBase64String(blob);
  });
};
