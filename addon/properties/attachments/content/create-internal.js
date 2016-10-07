import StringContent from './string-content-internal';
import Error from '../../../util/error';

export default (attachment, hash) => {
  let data = hash.data;
  let contentType = hash.type || hash.contentType || hash['content-type'];

  if(typeof data === 'string') {
    contentType = contentType || 'text/plain';
    return new StringContent(attachment, data, contentType);
  }

  throw new Error({
    error: 'invalid_attachment',
    reason: `unsupported attachment object.data '${data}'. data may be String, File or Blob`
  });
};
