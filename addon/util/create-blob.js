export default function(item, type) {
  if(!item) {
    return;
  }
  try {
    return new Blob([item], { type: type });
  } catch(e) {
    if(e.name === 'TypeError') {
      let BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder;
      if(BlobBuilder) {
        let builder = new BlobBuilder();
        builder.append(item);
        return builder.getBlob(type);
      }
    }
  }
}
