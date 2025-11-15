import $ from 'jquery';
import { identity, memoize } from 'lodash';

const get = memoize($.get);
const pendingPromise = { then() {} };

function mapError(xhr: JQuery.jqXHR): any {
  if (xhr.statusText !== 'abort') {
    throw xhr.statusText;
  }
  return pendingPromise;
}

export interface HttpGetResult<T = any> {
  promise(): Promise<T>;
  abort(): void;
}

export function httpGet<T = any>(url: string): HttpGetResult<T> {
  const xhr = get(url);
  return {
    promise() {
      return Promise.resolve(xhr.promise()).then(identity, mapError);
    },
    abort() {
      if ((xhr as any).status == null) {
        xhr.abort();
        (get as any).cache.delete(url);
      }
    },
  };
}
