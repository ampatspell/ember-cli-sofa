import Ember from 'ember';
import AttachmentContent from './content-internal';
import createFileLoader from '../../../util/file-loader/create';

const {
  merge,
  RSVP: { reject }
} = Ember;

export default class AttachmentFileContent extends AttachmentContent {

  constructor(attachment, file) {
    super(attachment);
    this.file = createFileLoader(file);
    this.state = {
      isLoading: false,
      isLoaded: false,
      isError: false,
      error: null
    };
    this.url = null;
    this.promise = null;
  }

  get contentModelName() {
    return 'file';
  }

  setState(state, notify) {
    merge(this.state, state);
    if(notify) {
      this.withPropertyChanges(changed => {
        changed('state');
      });
    }
  }

  didCreateURL(url) {
    this.withPropertyChanges(changed => {
      this.url = url;
      changed('url');
    });
  }

  getURL() {
    this.getURLPromise(true);
    return this.url;
  }

  getURLPromise(notify=true) {
    let promise = this.promise;

    if(promise) {
      return promise;
    }

    this.setState({
      isLoading: true,
    }, notify);

    promise = this.file.toBase64String().then(string => {
      let contentType = this.file.contentType;
      let url = `data:${contentType};base64,`;
      url += string;

      this.didCreateURL(url);

      this.setState({
        isLoading: false,
        isLoaded: true,
      }, true);

      return url;
    }, err => {
      this.setState({
        isLoading: false,
        isLoaded: false,
        isError: true,
        error: err
      }, true);

      return reject(err);
    });

    this.promise = promise;
    return promise;
  }

  getBase64Promise() {
    return this.file.toBase64String();
  }

  getState() {
    this.getURLPromise(false);
    return this.state;
  }

  //

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
    this.file = null;
    super.destroy();
  }

}
