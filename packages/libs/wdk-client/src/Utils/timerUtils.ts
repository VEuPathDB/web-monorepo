/**
 * Utils related to timers and loops.
 */

export let requestAnimationFrame: (callback: FrameRequestCallback) => number;
export let cancelAnimationFrame: (handle: number) => void;

/** Normalize requestAnimationFrame functions */
(function() {
  requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame;
  cancelAnimationFrame = window.cancelAnimationFrame || window.webkitCancelAnimationFrame;

  if (!requestAnimationFrame) {
    let lastTime = 0;
    requestAnimationFrame = function(callback) {
      let currTime = new Date().getTime();
      let timeToCall = Math.max(0, 16 - (currTime - lastTime));
      let id = window.setTimeout(function() { callback(currTime + timeToCall); },
                                 timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };
    cancelAnimationFrame = function(id) {
      clearTimeout(id);
    };
  }

}());


/**
 * Holds a list of callback functions that are invoked repeatedly with a fixed
 * time delay between each call, as provided to the constructor. The default is
 * 200ms. The interval will stop when the list is empty and resume when it is
 * not empty.
 */
export class IntervalList {

  private _interval: number;
  private _callbacks: Function[];
  private _id: number|null;

  /**
   * @param {number} interval Time in ms.
   */
  constructor(interval = 200) {
    this._interval = interval;
    this._callbacks = [];
    this._id = null;
  }

  /**
   * Add a callback to the list. If the list was empty before this action,
   * the interval will be started.
   *
   * @param {Function} callback
   */
  add(callback: Function): void {
    this._callbacks.push(callback);
    if (this._id == null) {
      this.start();
    }
  }

  /**
   * Remove a callback from the list. If this action results in an empty list,
   * the interval will be stopped.
   *
   * @param {Function} callback
   */
  remove(callback: Function): void {
    let index = this._callbacks.indexOf(callback);
    if (index < 0) return;
    this._callbacks.splice(index, 1);
    if (this._callbacks.length === 0) {
      this.stop();
    }
  }

  /**
   * Start the interval.
   */
  start() {
    if (this._id !== null) {
      throw new Error("Attempting to start an interval that is already running.");
    }

    let loop = () => {
      this._id = window.setTimeout(() => {
        this._callbacks.forEach(invoke);
        loop();
      }, this._interval);
    };

    loop();

  }

  /**
   * Stop the interval.
   */
  stop() {
    if (this._id === null) {
      throw new Error("Attemping to stop an interval that is already stopped.");
    }
    window.clearTimeout(this._id);
    this._id = null;
  }

}

function invoke(fn: Function) { fn(); }
