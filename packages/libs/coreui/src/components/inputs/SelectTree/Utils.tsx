import "regenerator-runtime/runtime";
// Field types
// -----------

export interface Field {
  type?: string;
  term: string;
  display: string;
  parent?: string;
  isRange?: boolean;
}

export type TreeNode<T extends Field> = {
  field: T;
  children: TreeNode<T>[];
};
export type FieldTreeNode = TreeNode<Field>;

/**
 * Create an array of ancestor nodes for a given node predicate.
 */
export function findAncestorFields(tree: FieldTreeNode, term: string): Seq<Field> {
  if (tree.field.term === term) return Seq.of(tree.field);
  const ancestors = Seq.from(tree.children)
    .flatMap(child => findAncestorFields(child, term));
  if (ancestors.isEmpty()) return Seq.empty();
  return Seq.of(tree.field).concat(ancestors);
}

/** From TreeUtils */

export interface ChildrenGetter<T> {
  (t: T): T[];
}

export type Node<T> = T & {
  children: Array<Node<T>>;
}

/**
 * Create a Seq of tree nodes in preorder sequence.
 *
 *              1
 *             / \
 *            /   \
 *           /     \
 *          2       3
 *         / \     /
 *        4   5   6
 *       /       / \
 *      7       8   9
 *
 *     preorder:    1 2 4 7 5 3 6 8 9
 *
 * @param {Object} root
 * @return {Seq}
 */
export function preorderSeq<T>(root: Node<T>) {
  return Seq.from(preorder(root, n => n.children));
}

/**
 * Convert a tree into a new tree-like structure. The tree is traversed bottom-
 * up, and for each node, its mapped children are passed to the mapping
 * function. This allows the mapping function to integrate the mapped children
 * however it needs to.
 *
 * @param {mapFn} mapFn Mapping function to apply to each node.
 * @param {Function} getChildren A function that returns an iterable object over a node's children.
 * @param {any} root The root node of the tree whose structure is being mapped.
 */
export function mapStructure<T, U>(mapFn: (node: T, mappedChildren: U[]) => U, getChildren: ChildrenGetter<T>, root: T): U {
  let mappedChildren = Seq.from(getChildren(root))
    .map(child => mapStructure(mapFn, getChildren, child))
    .toArray();
  return mapFn(root, mappedChildren);
}

/**
 * Simple convenience method to identify nodes that are leaves
 * @param {Object} node representing root of subtree (possibly a leaf)
 * @return {Boolean} indicates true if the node is a leaf and false otherwise
 */
export function isLeaf <T>(node: T, getNodeChildren: ChildrenGetter<T>) {
  return getNodeChildren(node).length === 0;
 }

/**
 * Determine if a node is a branch
 * @param node
 * @param getNodeChildren
 */
export function isBranch<T>(node: T, getNodeChildren: ChildrenGetter<T>) {
  return !isLeaf(node, getNodeChildren);
}

 /**
 * Using recursion to return all the leaf nodes for the given node.
 * @param {Object} node representing root of subtree
 * @param {Array} initial list of leaf nodes (optional)
 * @return {Array} updated list of leaf nodes
 */
export function getLeaves <T>(node: T, getNodeChildren: ChildrenGetter<T>) {
  return Seq.from(preorder(node, getNodeChildren)).filter(node => isLeaf(node, getNodeChildren)).toArray();
}
  
  /**
   * Using recursion to return all the branch nodes for a given node
   * @param {Object} node representing root of subtree
   * @param {Array} initial list of branch nodes (optional)
   * @return {Array} updated list of branch nodes
   */
export function getBranches <T>(node: T, getNodeChildren: ChildrenGetter<T>, branches: T[] = []) {
  return Seq.from(preorder(node, getNodeChildren)).filter(node => isBranch(node, getNodeChildren)).toArray();
}

  /** top-down tree node iterator */
export function* preorder<T>(root: T, getChildren: ChildrenGetter<T>): Iterable<T> {
  yield root;
  let children = getChildren(root);
  let length = children.length;
  for (let i = 0; i < length; i++) {
    yield* preorder(children[i], getChildren);
  }
}
  

 /** From IterableUtils */

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
interface Iterable<T> {
  [Symbol.iterator](): Iterator<T>;
}
  
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

  filter<U extends T>(fn: Guard<T, U>): Seq<U>;
  filter(fn: Predicate<T>): Seq<T>;
  filter(fn: Predicate<T>) {
    return new Seq(filter(fn, this));
  }

  some(fn: Predicate<T>) {
    return some(fn, this);
  }

  reduce<U>(fn: Reducer<T, U>, value: U): U {
    return reduce(fn, value, this);
  }

  toArray() {
    return this.reduce((arr: T[], item: T) => (arr.push(item), arr), []);
  }

  isEmpty() {
    return !this.some(() => true);
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
  
export function filter<T, U extends T>(fn: Guard<T, U>, iterable: Iterable<T>): Iterable<U>;
export function filter<T>(fn: Predicate<T>, iterable: Iterable<T>): Iterable<T>;
export function* filter<T>(fn: Predicate<T>, iterable: Iterable<T>) {
  for (let iter = iterable[Symbol.iterator]();;) {
    let { done, value } = iter.next();
    if (done) break;
    if (fn(value)) yield value;
  }
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
  
/** From ComponentUtils */

/** Create a React Element using preformatted HTML */
export function safeHtml<P>(str: string, props?: P, Component?: React.ComponentClass<P>): JSX.Element;
export function safeHtml<P>(str: string, props?: P, Component?: React.StatelessComponent<P>): JSX.Element;
export function safeHtml<P>(str: string, props?: P, Component?: string): JSX.Element;
export function safeHtml<P>(str = '', props?: P, Component: any = 'span'): JSX.Element {
  if (str.indexOf('<') === -1) {
    return <Component {...props}>{str}</Component>
  }
  // Use innerHTML to auto close tags
  let container = document.createElement('div');
  container.innerHTML = str;
  return <Component {...props} dangerouslySetInnerHTML={{ __html: container.innerHTML }}/>;
}

/**
 * Makes a copy of current, adds value if not present, removes if present, and
 * returns the copy.
 * @param {Array<T>} array array to modify
 * @param {<T>} value to check against
 * @return {Array<T>} modified copy of original array
 */
export function addOrRemove<T>(array: T[], value: T) : T[] {
  return (array.indexOf(value) == -1 ?
    // not currently present; add
    array.concat(value) :
    // already there; remove
    array.filter(elem => elem != value));
}

/** From SearchUtils */

/**
 * Split search query string on whitespace, unless wrapped in quotes
 * @param {string} searchQueryString A string representing the search query
 * @returns {Array<String>} A set of query terms parsed from searchQueryString
 */
export function parseSearchQueryString(searchQueryString: string) {
  let match = searchQueryString.match(/[^\s"]+|"[^"]*"/g);
  if (match == null) return [];
  return match.map(function (queryTerm) {
    if (queryTerm.startsWith('"')) {
      // remove wrapping quotes and asterisks from phrases
      return queryTerm.replace(/(^")|("$)|\*/g, '');
    } else {
      // remove stray quotes
      return queryTerm.replace(/(^")|("$)/g, '');
    }
  });
}