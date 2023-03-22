import {pruneDescendantNodes, Node} from 'wdk-client/Utils/TreeUtils';

export type OntologyNode<T> = Node<T & {
  properties: {[key: string]: Array<string>}
}>

export interface Ontology<T> {
  name: string;
  tree: OntologyNode<T>;
}

/**
 * Get a sub-tree from an Ontology. The `leafPredicate` function
 * is used to find the leaves of the tree to return.
 *
 * @param {Ontology} ontology
 * @param {Function} leafPredicate
 */
export function getTree<T>(ontology: Ontology<T>, leafPredicate: (node: T) => boolean) {
  return pruneDescendantNodes(node => nodeHasChildren(node) || leafPredicate(node), ontology.tree);
}

/**
 * Callback to provide the node children
 * @param node - given node
 * @returns {Array}  child nodes
 */
export let getNodeChildren = <T>(node: OntologyNode<T>) =>
  node.children;

export let nodeHasChildren = <T>(node: OntologyNode<T>) =>
  getNodeChildren(node).length > 0;

let includes = <T>(array: Array<T>, value: T) =>
  Boolean(array != null && array.indexOf(value) > -1);

export let nodeHasProperty = <T>(name: string, value: string, node: OntologyNode<T>) =>
  includes(node.properties[name], value);

export let getPropertyValues = <T>(name: string, node: OntologyNode<T>) =>
  (node.properties && node.properties[name]) || [];

export let getPropertyValue = <T>(name: string, node: OntologyNode<T>) =>
  node.properties && node.properties[name] && node.properties[name][0];
