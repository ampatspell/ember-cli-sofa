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

const wrap = (file) => {
  const opts = file[options];

  const notifyTarget = hash => {
    if(opts.target) {
      opts.observers.forEach(observer => {
        observer.filePropertiesDidChange(hash);
      });
    }
  }

  const progress = value => notifyTarget({ progress: value });

  file.contentType = fileContentType(file);

  file.arrayBuffer = () => {
    let promise = opts.arrayBufferPromise;
    if(!promise) {
      notifyTarget({ isLoading: true, isLoaded: false, isError: false, progress: 0, error: null });
      promise = readFile(file, progress).then(result => {
        notifyTarget({ isLoading: false, isLoaded: true, isError: false, progress: 100, error: null });
        return result;
      }, err => {
        notifyTarget({ isLoading: false, isLoaded: false, isError: true, progress: 0, error: err });
        return reject(err);
      });
      opts.arrayBufferPromise = promise;
    }
    return promise;
  };

  file.base64String = () => {
    let promise = opts.base64StringPromise;
    if(!promise) {
      promise = file.arrayBuffer().then(buffer => {
        let string = arrayBufferToBase64(buffer);
        if(!string) {
          return reject(new SofaError({ error: 'file_load', reason: 'File too large' }));
        }
        return string;
      }).then(result => {
        return result;
      }, (err) => {
        notifyTarget({ error: err });
        return reject(err);
      });
      opts.base64StringPromise = promise;
    }
    return promise;
  };

  return file;
};

export function wrapFile(file) {
  if(!file[options]) {
    file[options] = {
      observers: Ember.A()
    };
    file = wrap(file);
  }
  return file;
}

export function addFileObserver(file, target) {
  file[options].observers.addObject(target);
}

export function removeFileObserver(file, target) {
  file[options].observers.removeObject(target);
}
