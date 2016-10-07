import Ember from 'ember';
import AttachmentContent from './content-internal';
// TODO: crappy import
import { wrapFile, addFileObserver, removeFileObserver } from '../../../couch/util/file';

const {
  run: { next }
} = Ember;

export default class AttachmentFileContent extends AttachmentContent {

  constructor(attachment, file) {
    super(attachment);
    this.file = wrapFile(file);
    addFileObserver(file, this);
    this.state = {
      isLoading: false,
      isLoaded: false,
      isError: false,
      progress: 0,
      error: null
    };
    this.url = null;
  }

  get contentModelName() {
    return 'file';
  }

  filePropertiesDidChange(props) {
    let state = this.state;
    this.withPropertyChanges(changed => {
      for(let key in props) {
        let value = props[key];
        if(value !== state[key]) {
          state[key] = value;
          changed(key);
        }
      }
    });
  }

  didCreateURL(url) {
    this.withPropertyChanges(changed => {
      this.url = url;
      changed('url');
    });
  }

  getURL() {
    let url = this.url;
    if(!url) {
      this.getPromise();
    }
    return url;
  }

  getPromise() {
    return this.file.base64String().then(string => {
      let contentType = this.file.contentType;
      let url = `data:${contentType};base64,`;
      url += string;
      this.didCreateURL(url);
      return url;
    });
  }

  getArrayBufferPromise() {
    return this.file.arrayBuffer();
  }

  getBase64Promise() {
    return this.file.base64String();
  }

  getStateProperty(key) {
    // TODO: get rid of this crap along with wrapFile
    if(this.state.isLoading === false) {
      next(() => {
        this.getPromise();
      });
    }
    return this.state[key];
  }

  serialize(preview) {
    if(preview) {
      return {
        content_type: this.contentType,
        info: {
          source: 'file',
          filename: this.file.name
        }
      };
    } else {
      return {
        data: this.file
      };
    }
  }

  destroy() {
    removeFileObserver(this.file, this);
    super.destroy();
  }

}
