import Ember from 'ember';
import SofaError from '../../util/error';
import readFile from './file-reader';
import fileContentType from './file-content-type';
import arrayBufferToBase64 from './array-buffer-to-base64';

const {
  isEmpty,
  RSVP: { reject }
} = Ember;

const options = '__sofa';

function wrap(file, target) {
  let opts = file[options];

  function setProperties(hash) {
    if(target && !target.isDestroying) {
      target.setProperties(hash);
    }
  }

  function progress(value) {
    setProperties({ progress: value });
  }

  file.contentType = fileContentType(file);

  file.arrayBuffer = function() {
    let promise = opts.arrayBufferPromise;
    if(!promise) {
      setProperties({ isLoading: true, isLoaded: false, isError: false, progress: 0, error: null });
      promise = readFile(file, progress).then((result) => {
        setProperties({ isLoading: false, isLoaded: true, isError: false, progress: 100, error: null });
        return result;
      }, (err) => {
        setProperties({ isLoading: false, isLoaded: false, isError: true, progress: 0, error: err });
        return reject(err);
      });
      opts.arrayBufferPromise = promise;
    }
    return promise;
  };

  file.base64String = function() {
    let promise = opts.base64StringPromise;
    if(!promise) {
      promise = file.arrayBuffer().then((buffer) => {
        let string = arrayBufferToBase64(buffer);
        if(!string) {
          return reject(new SofaError({ error: 'file_load', reason: 'File too large' }));
        }
        return string;
      }).then((result) => {
        return result;
      }, (err) => {
        setProperties({ error: err });
        return reject(err);
      });
      opts.base64StringPromise = promise;
    }
    return promise;
  };

  return file;
}

export default function(file, target) {
  if(file[options]) {
    return file;
  }
  file[options] = {};
  return wrap(file, target);
}
