import AttachmentContent from './content-internal';

export default class AttachmentStringContent extends AttachmentContent {

  constructor(attachment, data, contentType) {
    super(attachment);
    this.data = data;
    this.contentType = contentType;
  }

  get contentModelName() {
    return 'string';
  }

  serialize(preview) {
    return {
      content_type: this.contentType,
      data:         this.data
    };
  }

}
