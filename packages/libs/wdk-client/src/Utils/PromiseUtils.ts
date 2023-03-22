// Utilities for working with Promises.

interface PromiseFactory<T> {
  (...args: any[]): Promise<T>;
}

// A Promise that never leaves the pending state.
export const pendingPromise = { then() { } } as Promise<any>;

export function delay(ms: number): Promise<undefined> {
  return new Promise(function(resolve) {
    window.setTimeout(resolve, ms);
  });
}

/**
 * Detect if `maybePromise` is a Promise.
 * @param {any} maybePromise
 * @returns {boolean}
 */
export function isPromise<T>(maybePromise: any): maybePromise is Promise<T> {
  return maybePromise != null && typeof maybePromise.then === 'function';
}

/**
 * Given a function that returns a Promise, this will return a new
 * function that returns a Promise such that only the latest created
 * Promise will resolve or reject.
 *
 * A pattern where this is useful is if you are listening to events that are
 * fired repeatedly, but you only care about the latest event, such as a
 * keypress in an input box. Each keypress can invoke a function that
 * makes an ajax request and returns a Promise that resolves with the response.
 * By applying `latestPromise` to this function, there is no need to cancel the
 * previous requests, or to track which is the latest.
 *
 * @param {Function} promiseFactory A function that returns a Promise.
 * @returns {Function} A function that returns a Promise.
 */
export function latest<T>(promiseFactory: PromiseFactory<T>) {
  let latestPromise: Promise<T>;
  return function createPromise(this: any, ...args: any[]) {
    let thisPromise: Promise<T> = latestPromise = promiseFactory.apply(this, args);
    return thisPromise.then(
      data => {
        if (thisPromise === latestPromise) {
          return data;
        }
        else {
          return <Promise<T>>pendingPromise;
        }
      },
      reason => {
        if (thisPromise === latestPromise) {
          throw reason;
        }
        else {
          return <Promise<T>>pendingPromise;
        }
      }
    );
  };
}

/**
 * Function decorator that returns a new function such that each call waits for
 * the previous call's returned Promise to resolve before proceeding.
 *
 * @param promiseFactory Function that produces Promises
 */
export function synchronized<T>(promiseFactory: PromiseFactory<T>) {
  let queue: Promise<void> = Promise.resolve();
  return <PromiseFactory<T>>function enque(this: any, ...args: any[]) {
    const task = queue.then(() => promiseFactory.apply(this, args));
    queue = task.then(() => {}, () => {});
    return task;
  }
}

/**
 * Calls `resolveHandler` and `rejectHandler` in the order of the promises
 * in `promiseArray`, even if they resolve out of order.
 *
 * @param {Array<Promise<any>>} promiseArray
 * @param {Function} resolveHandler
 * @param {Function} rejectHandler
 * @returns {Promise}
 */
export function seq(promiseArray: Promise<any>[], resolveHandler: (res: any) => any, rejectHandler: (err: Error) => any) {
  return promiseArray.reduce(function(seq$, promise$) {
    return seq$.then(() => promise$.then(resolveHandler, rejectHandler));
  }, Promise.resolve());
}

export class Mutex {

  private _queue: Promise<any> = Promise.resolve();

  synchronize<T>(callback: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      return this._queue = this._queue.then(() => callback()).then(resolve, reject)
    })
  }

}

interface Deferred<T> extends Promise<T> {
  resolve(value: any): void;
  reject(value: any): void;
  asPromise(): Promise<T>;
}

/**
 * A Deffered is a way to expose the internals of a Promise's state management
 * functionality (e.g., resolve and reject functions). This makes it possible
 * to resolve or reject a Promise externally.
 *
 * You convert a deferred to a plain Promise using the `asPromise` method. This
 * is useful to hide the internals to a consumer:
 * ```
 * var deferred = createDeferred();
 * // ...
 * return deferred.asPromise();
 * ```
 */
export function createDeferred<T>(): Deferred<T> {
  let resolve: (value: any) => void;
  let reject: (value: any) => void;
  let promise = new Promise<T>(function(_resolve, _reject) {
    resolve = _resolve;
    reject = _reject;
  });
  return Object.assign(promise, {
    get resolve() {
      return resolve;
    },
    get reject() {
      return reject;
    },
    asPromise() {
      return promise;
    }
  });
}
