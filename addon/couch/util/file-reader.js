import Ember from 'ember';
import SofaError from '../../util/error';

const {
  RSVP: { defer }
} = Ember;

class FileLoader {
  constructor(file, progress) {
    this.file = file;
    this.progress = progress;
    this.deferred = defer('sofa:file-loader');
    this._createReader();
  }

  _createReader() {
    this.reader = new FileReader();

    this.reader.onprogress = (e) => {
      var value = Math.round((e.loaded * 100) / e.total);
      this.progress(value);
    };

    this.reader.onloadend = (e) => {
      var err = e.target.error;
      if(err) {
        this.deferred.reject(new SofaError({ error: 'file_load', reason: err.message }));
      } else {
        var arrayBuffer = e.target.result;
        this.deferred.resolve(arrayBuffer);
      }
      this.reader = null;
    };
  }

  load() {
    this.reader.readAsArrayBuffer(this.file);
    return this.deferred.promise;
  }
}

export default function(file, progress) {
  let loader = new FileLoader(file, progress);
  return loader.load();
}
