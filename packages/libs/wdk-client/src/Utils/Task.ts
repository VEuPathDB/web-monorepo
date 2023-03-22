import { noop } from 'lodash';

type CancelOperation = () => void;
type Operation<T, E> = (fulfill: (t: T) => void, reject: (e: E) => void) => CancelOperation | void;

/**
 * A Task is a container for an operation.
 *
 * The result of the operation can be accessed using operators such as map. The
 * Task can be executed using the run method.
 */
export class Task<T, E> {

  _operation: Operation<T, E>;

  static of<T, E>(t: T) {
    return new Task<T, E>(fulfill => void fulfill(t));
  }

  static reject<E, T>(e: E) {
    return new Task<T, E>((fulfill, reject) => void reject(e));
  }

  static fromPromise<T, E>(callback: () => Promise<T>) {
    return new Task<T, E>(function(fulfill, reject) {
      callback().then(fulfill, reject);
    });
  }

  constructor(operation: Operation<T, E>) {
    this._operation = operation;
  }

  run(onFulfilled: (t: T) => void = noop, onRejected: (e: E) => void = noop) {
    let isCancelled = false;
    function onFulfilledProxy(t: T) {
      if (!isCancelled) onFulfilled(t);
    }
    function onRejectedProxy(e: E) {
      if (!isCancelled) onRejected(e);
    }
    let _cancel = this._operation(onFulfilledProxy, onRejectedProxy);
    return function cance() {
      isCancelled = true;
      if (_cancel) (<CancelOperation>_cancel)();
    }
  }

  map<U>(func: (t: T) => U) {
    return new Task<U, E>((fulfill, reject) => {
      return this.run((value) => void fulfill(func(value)), reject);
    });
  }

  mapRejected<F>(func: (e: E) => F) {
    return new Task<T, F>((fulfill, reject) => {
      return this.run(fulfill, (e) => void reject(func(e)));
    })
  }

  chain<U>(func: (t: T) => Task<U, E>) {
    return new Task<U, E>((fulfill, reject) => {
      let innerCancel: CancelOperation | void;
      let outerCancel = this.run(
        (value) => {
          innerCancel = func(value).run( fulfill, reject);
        },
        reject
      );
      return () => {
        if (outerCancel) (outerCancel as CancelOperation)();
        if (innerCancel) (innerCancel as CancelOperation)(); };
    });
  }

  chainRejected<U, F>(func: (e: E) => Task<U, F>) {
    return new Task<T|U, F>((fulfill, reject) => {
      let innerCancel: CancelOperation | void;
      let outerCancel = this.run(
        fulfill,
        (error) => {
          innerCancel = func(error).run(fulfill, reject)
        }
      );
      return () => {
        if (outerCancel) (outerCancel as CancelOperation)();
        if (innerCancel) (innerCancel as CancelOperation)();
      };
    })
  }

}
