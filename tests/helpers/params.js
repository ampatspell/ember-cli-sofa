// https://gist.github.com/kares/956897

const re = /([^&=]+)=?([^&]*)/g;
const decodeRE = /\+/g; // Regex for replacing addition symbol with a space

function decode(str) {
  return decodeURIComponent(str.replace(decodeRE, " "));
}

function parseParams(query) {
  const params = {};
  let e;
  while (e = re.exec(query)) {
    let k = decode( e[1] ), v = decode( e[2] );
    if (k.substring(k.length - 2) === '[]') {
      k = k.substring(0, k.length - 2);
      (params[k] || (params[k] = [])).push(v);
    } else {
      params[k] = v;
    }
  }
  return params;
}

const search = window.location.search.split('?')[1];
const params = parseParams(search);

export default params;
