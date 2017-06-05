import AttachmentContent from './content-internal';

export const mapping = {
  content_type: 'contentType',
  digest: 'digest',
  revpos: 'revpos',
  length: 'length'
};

export default class AttachmentStubContent extends AttachmentContent {

  constructor(attachment, data) {
    super(attachment);
    this.type = 'remote';
    this.data = data;
  }

  get isStub() {
    return true;
  }

  get contentModelName() {
    return 'stub';
  }

  get internalModel() {
    return this.attachment.attachments.internalModel;
  }

  get url() {
    let doc = this.internalModel.url;
    let name = encodeURIComponent(this.attachment.name);
    let revpos = this.data.revpos;
    return `${doc}/${name}?_r=${revpos}`;
  }

  serialize() {
    return this.data;
  }

  deserialize(doc) {
    this.withPropertyChanges(changed => {
      for(let key in this.data) {
        let value = this.data;
        if(value !== doc[key]) {
          this.data[key] = doc[key];
          changed(mapping[key]);
        }
      }
    });
  }

}
