export function hasFile() {
  return !!window.File;
}

export function hasBlob() {
  return !!window.Blob;
}

export function isFile(arg) {
  if(!hasFile()) {
    return false;
  }
  /* global File */
  return arg instanceof File;
}

export function isBlob(arg) {
  if(!hasBlob()) {
    return false;
  }
  /* global Blob */
  return arg instanceof Blob;
}

export function isFileOrBlob(arg) {
  return isFile(arg) || isBlob(arg);
}

export function hasToBase64() {
  return !!window.btoa;
}

export function toBase64(arg) {
  if(!hasToBase64()) {
    return;
  }
  /* global btoa */
  return btoa(arg);
}
