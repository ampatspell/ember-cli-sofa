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
    let internalModel = this.internalModel;
    let database = internalModel.database;

    if(!database) {
      return;
    }

    let doc = {
      url: internalModel.url,
      id:  encodeURIComponent(internalModel.docId),
      rev: internalModel.rev
    };

    let attachment = {
      name:   encodeURIComponent(this.attachment.name),
      revpos: this.data.revpos
    };

    let url = database.attachmentUrlForOptions({ database, doc, attachment });

    if(!url) {
      url =`${doc.url}/${attachment.name}?_r=${attachment.revpos}`;
    }

    return url;
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
