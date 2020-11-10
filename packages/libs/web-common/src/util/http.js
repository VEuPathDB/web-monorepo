import $ from 'jquery';
import { identity, memoize } from 'lodash';

const get = memoize($.get);
const pendingPromise = { then() {} };

function mapError(xhr) {
  if (xhr.statusText !== 'abort') {
    throw xhr.statusText;
  }
  return pendingPromise;
}

export function httpGet(url) {
  const xhr = get(url);
  return {
    promise() {
      return Promise.resolve(xhr.promise()).then(identity, mapError);
    },
    abort() {
      if (xhr.status == null) {
        xhr.abort();
        get.cache.delete(url);
      }
    }
  };
}
