import Error from '../../util/error';

class AttachmentContent {

  constructor(attachment) {
    this.attachment = attachment;
    this.type = 'local';
  }

}

class AttachmentStringContent extends AttachmentContent {

  constructor(attachment, data, contentType) {
    super(attachment);
    this.data = data;
    this.contentType = contentType;
    console.log(this);
  }

}

export default (attachment, hash) => {
  let data = hash.data;
  let contentType = hash.type || hash.contentType || hash['content-type'];
  if(typeof data === 'string') {
    return new AttachmentStringContent(attachment, data, contentType || 'text/plain');
  }
  throw new Error({
    error: 'invalid_attachment',
    reason: `unsupported attachment object.data '${data}'. data may be String, File or Blob`
  });
}
