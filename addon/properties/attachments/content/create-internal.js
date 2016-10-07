import StringContent from './string-content-internal';
import StubContent from './stub-content-internal';
import FileContent from './file-content-internal';
import Error from '../../../util/error';
// TODO: crappy import
import { isFileOrBlob } from '../../../couch/util/file-availability';

export default (attachment, hash) => {
  if(hash.stub === true) {
    return new StubContent(attachment, hash);
  }

  let data = hash.data;
  let contentType = hash.type || hash.contentType || hash['content-type'];

  if(typeof data === 'string') {
    contentType = contentType || 'text/plain';
    return new StringContent(attachment, data, contentType);
  }

  if(isFileOrBlob(data)) {
    return new FileContent(attachment, data);
  }

  throw new Error({
    error: 'invalid_attachment',
    reason: `unsupported attachment object.data '${data}'. data may be String, File or Blob`
  });
};
