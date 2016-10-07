import Ember from 'ember';
import mimeType from './mime-type';

const {
  isEmpty
} = Ember;

export default function(file) {
  let type = file.type;
  if(isEmpty(type)) {
    let name = file.name;
    if(name) {
      type = mimeType(name);
      if(type) {
        return type;
      }
    }
    return 'application/octet-stream';
  }
  return type;
}
