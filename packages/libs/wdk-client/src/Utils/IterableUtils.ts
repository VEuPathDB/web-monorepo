// Type definitions
interface Mapper<T, U> {
  (x: T): U;
}
interface FlatMapper<T, U> {
  (x: T): Iterable<U>;
}
interface Predicate<T> {
  (x: T): boolean;
}
interface Guard<T, U extends T> {
  (a: T): a is U;
}
interface Reducer<T, U> {
  (acc: U, x: T): U;
}
interface Collector<T, U> {
  from: (i: Iterable<T>) => U;
};

/**
 * Useful operators for Iterables.
 *
 * The module exports the class `Seq` which creates a wrapper that exposes
 * a fluent interface for traversing and manipulating the underlying iterable
 * object using operators.
 *
 * The module also exports each operator as a function for use in isolation.
 *
 * All methods and functions return a new Iterable object. Iteration is lazy
 * and will only execute when a value is requested (toArray, reduce, etc).
 * The iteration will terminate as early as possible.
 *
 * For example, the following `Seq` code will only iterate 3 times:
 *
 *    let array = [];
 *    for (let i = 1; i <= 1000; i++) {
 *      array.push(i);
 *    }
 *
 *    // 3 iterations
 *    Seq.from(array)
 *      .map(n => n * n)
 *      .filter(n => n % 2 === 1)
 *      .takeUntil(n => n > 30)
 *      .toArray() // [ 1, 9, 25 ]
 *
 */

/**
 * Wraps `iterable` in an object with collection operations.
 */
export class Seq<T> {

  private static readonly EMPTY = new Seq([]);

  // constructors

  static empty<T>() {
    return Seq.EMPTY as Seq<T>;
  }

  static of<T>(...values: T[]) {
    return (values.length === 0 ? Seq.empty() : new Seq(values)) as Seq<T>;
  }

  static from<T>(iterable: Iterable<T>) {
    return new Seq(iterable);
  }

  static concat<T>(...iterables: Iterable<T>[]) {
    return Seq.from(concat(...iterables));
  }

  private _iterator?: Iterator<T>;
  private readonly _cache: T[] = [];

  private constructor(private _iterable: Iterable<T>) { }

  *[Symbol.iterator]() {

    // Since this._iterator can be a generator object, we cache the iteration
    // so it can be replayed. Generator objects are stateful, so this is
    // necessary.
    yield* this._cache;
    if (this._iterator == null) {
      this._iterator = this._iterable[Symbol.iterator]();
    }
    while (true) {
      const { done, value } = this._iterator.next();
      if (done) {
        break;
      }
      else {
        this._cache.push(value);
        yield value;
      }
    }
  }

  concat(...iterables: Iterable<T>[]) {
    return new Seq(concat(this, ...iterables));
  }

  map<U>(fn: Mapper<T, U>) {
    return new Seq(map(fn, this));
  }

  flatMap<U>(fn: FlatMapper<T, U>) {
    return new Seq(flatMap(fn, this));
  }

  uniq() {
    return new Seq(uniq(this));
  }

  uniqBy<U>(fn: Mapper<T, U>) {
    return new Seq(uniqBy(fn, this));
  }

  orderBy<U>(fn: Mapper<T, U>, reverse = false) {
    const reverseBit = reverse ? -1 : 1;
    return new Seq(this.toArray().sort((a: T, b: T) => {
      const mappedA = fn(a);
      const mappedB = fn(b);
      return mappedA < mappedB ? -1 * reverseBit
           : mappedA > mappedB ? 1 * reverseBit
           : 0;
    }))
  }

  filter<U extends T>(fn: Guard<T, U>): Seq<U>;
  filter(fn: Predicate<T>): Seq<T>;
  filter(fn: Predicate<T>) {
    return new Seq(filter(fn, this));
  }

  take(n: number) {
    return new Seq(take(n, this));
  }

  takeLast(n: number) {
    return new Seq(takeLast(n, this));
  }

  takeWhile<U extends T>(fn: Guard<T, U>): Seq<U>;
  takeWhile(fn: Predicate<T>): Seq<T>
  takeWhile(fn: Predicate<T>) {
    return new Seq(takeWhile(fn, this));
  }

  drop(n: number) {
    return new Seq(drop(n, this));
  }

  dropLast(n: number) {
    return new Seq(dropLast(n, this));
  }

  dropWhile<U extends T>(fn: Guard<T, U>): Seq<U>;
  dropWhile(fn: Predicate<T>): Seq<T>;
  dropWhile(fn: Predicate<T>) {
    return new Seq(dropWhile(fn, this));
  }

  find<U extends T>(fn: Guard<T, U>): U;
  find(fn: Predicate<T>): T;
  find(fn: Predicate<T>) {
    return find(fn, this);
  }

  findLast<U extends T>(fn: Guard<T, U>): U;
  findLast(fn: Predicate<T>): T;
  findLast(fn: Predicate<T>) {
    return findLast(fn, this);
  }

  every(fn: Predicate<T>) {
    return every(fn, this);
  }

  some(fn: Predicate<T>) {
    return some(fn, this);
  }

  includes(item: T) {
    return includes(item, this);
  }

  reduce<U>(fn: Reducer<T, U>, value: U): U {
    return reduce(fn, value, this);
  }

  join(separator: string) {
    return join(separator, this);
  }

  toArray() {
    return this.reduce((arr: T[], item: T) => (arr.push(item), arr), []);
  }

  into<U>(Collector: Collector<T, U>) {
    return Collector.from(this);
  }

  first() {
    return first(this);
  }

  last() {
    return last(this);
  }

  rest() {
    return rest(this);
  }

  isEmpty() {
    return !this.some(() => true);
  }

  forEach(fn: (t:T) => void) {
    for (let iter = this[Symbol.iterator]();;) {
      let { done, value } = iter.next();
      if (done) break;
      fn(value);
    }
    return this;
  }

  groupBy<S>(fn: (t: T) => S) {
    const groupMap = this.reduce((map: Map<S, T[]>, entry: T) => {
      const key = fn(entry);
      if (!map.has(key)) map.set(key, []);
      const group: T[] = map.get(key) as T[];
      group.push(entry);
      return map;
    }, new Map<S, T[]>());
    return Seq.from(groupMap);
  }

}


// XXX The for..of loop construct is not being used because babel adds a
// try-catch to the loop body, which deoptimizes the code path. See
// https://github.com/google/traceur-compiler/issues/1773.

export function* concat<T>(...iterables: Iterable<T>[]) {
  for (let i = 0; i < iterables.length; i++) {
    yield* iterables[i];
  }
}

export function* map<T, U>(fn: Mapper<T, U>, iterable: Iterable<T>) {
  for (let iter = iterable[Symbol.iterator]();;) {
    let { done, value } = iter.next();
    if (done) break;
    yield fn(value);
  }
}

export function* flatMap<T, U>(fn: FlatMapper<T, U>, iterable: Iterable<T>) {
  for (let iter = iterable[Symbol.iterator]();;) {
    let { done, value } = iter.next();
    if (done) break;
    yield* fn(value);
  }
}

export function* uniq<T>(iterable: Iterable<T>) {
  let values = new Set();
  for (let iter = iterable[Symbol.iterator]();;) {
    let { done, value } = iter.next();
    if (done) break;
    if (values.has(value) === false) {
      values.add(value);
      yield value;
    }
  }
}

export function* uniqBy<T, U>(fn: Mapper<T, U>, iterable: Iterable<T>) {
  let keys = new Set<U>();
  for (let iter = iterable[Symbol.iterator]();;) {
    let { done, value } = iter.next();
    if (done) break;
    let key = fn(value);
    if (keys.has(key) === false) {
      keys.add(key);
      yield value;
    }
  }
}

export function filter<T, U extends T>(fn: Guard<T, U>, iterable: Iterable<T>): Iterable<U>;
export function filter<T>(fn: Predicate<T>, iterable: Iterable<T>): Iterable<T>;
export function* filter<T>(fn: Predicate<T>, iterable: Iterable<T>) {
  for (let iter = iterable[Symbol.iterator]();;) {
    let { done, value } = iter.next();
    if (done) break;
    if (fn(value)) yield value;
  }
}

export function* take<T>(n: number, iterable: Iterable<T>) {
  let count = 0;
  for (let iter = iterable[Symbol.iterator]();;) {
    let { done, value } = iter.next();
    if (!done && count++ < n) yield value;
    else break;
  }
}

/**
 * Take the last `n` elements of `iterable`
 */
export function* takeLast<T>(n: number, iterable: Iterable<T>) {
  yield* Array.from(iterable).slice(-Math.max(0, n));
}

/**
 * Keep items until test returns false.
 */
export function takeWhile<T, U extends T>(fn: Guard<T, U>, iterable: Iterable<T>): Iterable<U>;
export function takeWhile<T>(fn: Predicate<T>, iterable: Iterable<T>): Iterable<T>;
export function* takeWhile<T>(fn: Predicate<T>, iterable: Iterable<T>) {
  for (let iter = iterable[Symbol.iterator]();;) {
    let { done, value } = iter.next();
    if (done || fn(value) === false) break;
    yield value;
  }
}

export function* drop<T>(n: number, iterable: Iterable<T>) {
  for (let iter = iterable[Symbol.iterator]();;) {
    let { done, value } = iter.next();
    if (done) break;
    if (n-- > 0) continue;
    yield value;
  }
}

export function* dropLast<T>(n: number, iterable: Iterable<T>) {
  yield* Array.from(iterable).slice(0, -Math.max(0, n));
}

/**
 * Ignore items until test returns false.
 */
export function dropWhile<T, U extends T>(fn: Guard<T, U>, iterable: Iterable<T>): Iterable<U>;
export function dropWhile<T>(fn: Predicate<T>, iterable: Iterable<T>): Iterable<T>;
export function* dropWhile<T>(fn: Predicate<T>, iterable: Iterable<T>) {
  let take = false;
  for (let iter = iterable[Symbol.iterator]();;) {
    let { done, value } = iter.next();
    if (done) break;
    if (take === false) take = !fn(value);
    if (take === true) yield value;
  }
}


// Return values -- an item from iterable collection, or a reduction

/**
 * Find the first item that test returns true for.
 */
export function find<T, U extends T>(test: Guard<T, U>, iterable: Iterable<T>): U;
export function find<T>(test: Predicate<T>, iterable: Iterable<T>): T;
export function find<T>(test: Predicate<T>, iterable: Iterable<T>) {
  for (let iter = iterable[Symbol.iterator]();;) {
    let { done, value } = iter.next();
    if (done) break;
    if (test(value) === true) return value;
  }
  return undefined;
}

/**
 * Find the last item that the test returns true for.
 */
export function findLast<T, U extends T>(test: Guard<T, U>, iterable: Iterable<T>): U;
export function findLast<T>(test: Predicate<T>, iterable: Iterable<T>): T;
export function findLast<T>(test: Predicate<T>, iterable: Iterable<T>) {
  let last: T|void;
  for (let iter = iterable[Symbol.iterator]();;) {
    let { done, value } = iter.next();
    if (done) break;
    if (test(value)) last = value;
  }
  return last;
}

export function first<T>(iterable: Iterable<T>) {
  return iterable[Symbol.iterator]().next().value;
}

export function last<T>(iterable: Iterable<T>) {
  let last: T|void;
  for (let iter = iterable[Symbol.iterator]();;) {
    let { done, value } = iter.next();
    if (done) break;
    last = value;
  }
  return last;
}

export function rest<T>(iterable: Iterable<T>) {
  return drop(1, iterable);
}

export function includes<T>(item: T, iterable: Iterable<T>): boolean {
  return some(t => t === item, iterable);
}

export function every<T>(test: Predicate<T>, iterable: Iterable<T>): boolean {
  for (let iter = iterable[Symbol.iterator]();;) {
    let { done, value } = iter.next();
    if (done) break;
    if (test(value) === false) return false;
  }
  return true;
}

export function some<T>(test: Predicate<T>, iterable: Iterable<T>): boolean {
  for (let iter = iterable[Symbol.iterator]();;) {
    let { done, value } = iter.next();
    if (done) break;
    if (test(value) === true) return true;
  }
  return false;
}

/**
 * Reduce collection to a single value.
 */
export function reduce<T, U>(fn: Reducer<T, U>, seedValue: U, iterable: Iterable<T>): U {
  let result = seedValue
  for (let iter = iterable[Symbol.iterator]();;) {
    let { done, value } = iter.next();
    if (done) break;
    result = fn(result, value);
  }
  return result;
}

export function join<T>(separator: string, iterable: Iterable<T>): string {
  return Array.from(iterable).join(separator);
}

