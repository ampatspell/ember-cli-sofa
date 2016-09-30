import Ember from 'ember';
import SofaError from '../error';

const {
  isNone,
  RSVP: { Promise, reject },
  run,
  run: { next },
  merge
} = Ember;

function makeSuccess(resolve) {
  return function(response, textStatus, jqXHR) {
    run(null, resolve, {
      response: response,
      textStatus: textStatus,
      jqXHR: jqXHR
    });
  };
}

function makeError(reject) {
  return function(jqXHR, textStatus, errorThrown) {
    run(null, reject, {
      jqXHR: jqXHR,
      textStatus: textStatus,
      errorThrown: errorThrown
    });
  };
}

function makeAbort(xhr) {
  return function() {
    if(xhr.readyState !== 4) {
      xhr.abort();
    }
  };
}

function raw(settings) {
  return new Promise((resolve, reject) => {
    settings.success = makeSuccess(resolve);
    settings.error = makeError(reject);
    let xhr = Ember.$.ajax(settings);
    settings.abort = makeAbort(xhr, settings);
  }, `sofa:request raw ${settings.type} ${settings.url}`);
}

function ajax(settings) {
  return raw(settings).then(result => {
    return result.response;
  }, `sofa:request ${settings.type} ${settings.url}`);
}

function objectToQueryString(obj) {
  if(!obj) {
    return;
  }
  let pairs = Ember.A();
  for(let key in obj) {
    let value = obj[key];
    if(!isNone(value)) {
      pairs.push([key, encodeURIComponent(value)].join('='));
    }
  }
  return pairs.join('&');
}

function onRequestError(err, request) {
  let xhr = err.jqXHR;

  let opts = {};

  opts.status = xhr.status;
  opts.error = err.textStatus;
  opts.reason = err.errorThrown;

  let json = xhr && xhr.responseJSON;
  if(json) {
    opts.error = json.error || err.error;
    opts.reason = json.reason || err.reason;
  }

  opts.request = {
    type: request.type,
    url: request.url
  };

  return new SofaError(opts);
}

export function request(opts) {
  let qs = objectToQueryString(opts.qs);
  if(qs) {
    opts.url = [opts.url, qs].join('?');
  }

  if(opts.json === true) {
    opts.dataType = 'json';
    opts.contentType = 'application/json';
    opts.headers = merge({
      'Accept': 'application/json'
    }, opts.headers);
    if(opts.data) {
      opts.data = JSON.stringify(opts.data);
    }
  }
  delete opts.json;

  opts.cache = false;
  opts.xhrFields = merge({ withCredentials: true }, opts.xhrFields);

  return ajax(opts).then(null, (err) => {
    return reject(onRequestError(err, opts));
  }, `sofa:request ${opts.type} ${opts.url}`);
}

export default Ember.Object.extend({

  send(opts) {
    return request(opts).then((result) => {
      return new Promise(function(resolve) {
        next(function() {
          resolve(result);
        });
      }, 'sofa:request next');
    });
  }

});
