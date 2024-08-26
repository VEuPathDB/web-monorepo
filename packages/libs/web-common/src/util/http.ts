import { memoize } from 'lodash';

export function httpGet(url: string) {
  const controller = new AbortController();
  const { signal } = controller;
  const response$ = fetch(url, { signal });
  return {
    async promise() {
      try {
        const response = await response$;
        if (signal.aborted) {
          return Promise.resolve();
        }
        return await response.json();
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return Promise.resolve();
        }
        throw error;
      }
    },
    abort() {
      controller.abort();
    },
  };
}
