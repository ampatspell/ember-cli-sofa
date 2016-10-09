import blobutil from 'sofa/blob-util';

export default function(item, type) {
  return blobutil.createBlob([ item ], { type });
}
