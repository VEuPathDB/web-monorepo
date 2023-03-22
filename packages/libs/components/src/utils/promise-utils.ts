/**
 * A Promise factory that can be awaited outside of the calling context of the
 * Promise. This is useful for coordinating two unconnected processes around
 * the completion of a Promise's underlying task.
 */
export interface SharedPromise<T> {
  promise: Promise<T>;
  run: () => Promise<T>;
}

/**
 * Creates a {@link SharedPromise} based on the return value of `callback`.
 * @param callback Function that returns a Promise
 * @returns SharedPromise
 */
export function makeSharedPromise<T>(
  callback: () => Promise<T>
): SharedPromise<T> {
  let resolve: (value: T) => void;
  let reject: (value: unknown) => void;
  const promise = new Promise<T>((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });

  function run() {
    return callback().then(
      (result) => {
        resolve(result);
        return result;
      },
      (error) => {
        reject(error);
        throw error;
      }
    );
  }
  return {
    promise,
    run,
  };
}
