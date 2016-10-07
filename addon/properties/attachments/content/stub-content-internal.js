import AttachmentContent from './content-internal';

export default class AttachmentStubContent extends AttachmentContent {

  constructor(attachment, data) {
    super(attachment);
    this.type = 'remote';
    this.data = data;
  }

  get contentModelName() {
    return 'stub';
  }

  get contentType() {
    return this.data.content_type;
  }

  get digest() {
    return this.data.digest;
  }

  get revpos() {
    return this.data.revpos;
  }

  get length() {
    return this.data.length;
  }

  serialize(preview) {
    return this.data;
  }

}
