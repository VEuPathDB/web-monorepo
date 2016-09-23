import $ from 'jquery';
import { identity, memoize } from 'lodash';

const get = memoize($.get);

function mapError(xhr) {
  if (xhr.statusText !== 'abort') {
    throw xhr.statusText;
  }
}

export function httpGet(url) {
  const xhr = get(url);
  return {
    promise() {
      return xhr.promise().then(identity, mapError);
    },
    abort() {
      if (xhr.status == null) {
        xhr.abort();
        get.cache.delete(url);
      }
    }
  };
}
