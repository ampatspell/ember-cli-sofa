import AttachmentContent from './content-internal';
// TODO: crappy import
import fileContentType from '../../../couch/util/file-content-type';

export default class AttachmentFileContent extends AttachmentContent {

  constructor(attachment, file) {
    super(attachment);
    this.file = file;
    this.contentType = fileContentType(file);
  }

  get contentModelName() {
    return 'file';
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

}
