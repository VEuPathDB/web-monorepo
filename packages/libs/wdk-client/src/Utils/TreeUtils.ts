import { Seq } from 'wdk-client/Utils/IterableUtils';

export type Node<T> = T & {
  children: Array<Node<T>>;
}

export interface ChildrenGetter<T> {
  (t: T): T[];
}

// Helper function to push values into an array, and to return that array.
// `push` returns the value added, so this is useful when we want the array
// back. This is more performant than using `concat` which creates a new array.
function pushInto <T>(array: T[], ...values: T[]) {
  return (array.push(...values), array);
}

// Shallow comparison of two arrays
function shallowEqual <T>(array1: T[], array2: T[]) {
  if (array1.length !== array2.length) return false;
  for (let i = 0; i < array1.length; i++) {
    if (array1[i] !== array2[i]) return false;
  }
  return true;
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

/** bottom-up tree node iterator */
export function* postorder<T>(root: T, getChildren: ChildrenGetter<T>): Iterable<T> {
  let children = getChildren(root);
  let length = children.length;
  for (let i = 0; i < length; i++) {
    yield* postorder(children[i], getChildren);
  }
  yield root;
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
 * Create a Seq of tree nodes in postorder sequence.
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
 *     postorder:   7 4 5 2 8 9 6 3 1
 *
 * @param {Object} root
 * @return {Seq}
 */
export function postorderSeq<T>(root: Node<T>) {
  return Seq.from(postorder(root, n => n.children));
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
 * Convert a tree into a new structure, much like array.reduce. The tree is
 * traversed bottom-up.
 */
export const foldStructure = <T, U>(reducer: (value: U, node: Node<T>) => U, seed: U, root: Node<T>): U =>
  reducer(root.children.reduce((acc: U, next: Node<T>) => foldStructure(reducer, acc, next), seed) as U, root)

/**
 * For any node in a tree that does not pass `nodePredicate`, replace it with
 * its children. A new tree will be returned.
 *
 * @param {Function} fn Predicate function to determine if a node
 * will be kept.
 * @param {Object} root Root node of a tree.
 * @return {Object}
 */
export function pruneDescendantNodes<T>(fn: (node: Node<T>) => boolean, root: Node<T>) {
  let prunedChildren = pruneNodes(fn, root.children);
  return prunedChildren === root.children
    ? root
    : Object.assign({}, root, {
      children: prunedChildren
    })
}

/**
 * Recursively replace any node that does not pass `nodePredicate` with its
 * children. A new array of nodes will be returned.
 *
 * @param {Function} fn Predicate function to determine if a node
 * will be kept.
 * @param {Array} nodes An array of nodes. This will typically be the children
 * of a node in a tree.
 * @return {Array}
 */
export function pruneNodes <T>(fn: (node: Node<T>) => boolean, nodes: Node<T>[]): Node<T>[] {
  let prunedNodes = nodes.reduce((prunedNodes, node) => {
    let prunedNode = pruneDescendantNodes(fn, node);
    return fn(prunedNode)
      ? pushInto(prunedNodes, prunedNode)
      : pushInto(prunedNodes, ...prunedNode.children);
  }, [] as Node<T>[]);
  return shallowEqual(nodes, prunedNodes) ? nodes : prunedNodes;
}

/**
 * If the root node has only one child, replace the root node with it's child.
 *
 * @param {Object} root Root node of a tree
 * @return {Object} Tree
 */
export function compactRootNodes <T>(root: Node<T>): Node<T> {
  return root.children.length === 1 ? compactRootNodes(root.children[0])
  : root
}

export function mapNodes <T>(nodeTransform: (root: Node<T>) => Node<T>, root: Node<T>): Node<T> {
  return Object.assign({}, nodeTransform(root), {
    children: root.children.map(child => mapNodes(nodeTransform, child))
  });
}

/**
 * Get an array of nodes that satisfy nodePredicate
 */
export function filterNodes <T>(nodePredicate: (node: Node<T>) => boolean, node: Node<T>) {
  return preorderSeq(node).filter(nodePredicate).toArray();
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
