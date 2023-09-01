import { Seq } from '@veupathdb/wdk-client/lib/Utils/IterableUtils';
import { pruneDescendantNodes } from '@veupathdb/wdk-client/lib/Utils/TreeUtils';
import { getTree } from '@veupathdb/wdk-client/lib/Utils/OntologyUtils';
import {
  getRecordClassName,
  isQualifying,
} from '@veupathdb/wdk-client/lib/Utils/CategoryUtils';

let isSearchMenuScope = isQualifying({ targetType: 'search', scope: 'menu' });

/**
 * Gets Category ontology and returns a tree, where each immediate child node
 * is a recordClass. Optionally, indicate record classes to include or exclude
 * via the `options` object. If `options.include` is defined, `options.exclude`
 * will be ignored.
 *
 * This is used by bubbles, query grid, and menus.
 *
 * @param {Ontology} ontology
 * @param {RecordClass[]} recordClasses
 * @returns RecordClassTree
 */
export function getSearchMenuCategoryTree(ontology, recordClasses) {
  let recordClassMap = new Map(recordClasses.map((rc) => [rc.fullName, rc]));
  // get searches scoped for menu
  let categoryTree = getTree(ontology, isSearchMenuScope);
  return groupByRecordClass(categoryTree, recordClassMap);
}

/**
 *
 * @param categoryTree
 * @param recordClassMap
 * @param options?
 * @returns {RecordClassTree[]}
 */
function groupByRecordClass(categoryTree, recordClassMap) {
  let recordClassCategories = Seq.from(recordClassMap.keys())
    .map((name) => recordClassMap.get(name))
    .map(getRecordClassTree(categoryTree))
    .filter(isDefined)
    .toArray();
  return { children: recordClassCategories };
}

function isDefined(maybe) {
  return maybe !== undefined;
}

function getRecordClassTree(categoryTree) {
  return function (recordClass) {
    let tree = pruneDescendantNodes(
      isRecordClassTreeNode(recordClass),
      categoryTree
    );
    if (tree.children.length === 0) return;
    return {
      properties: {
        label: [recordClass.fullName],
        'EuPathDB alternative term': [recordClass.displayNamePlural],
      },
      children: tree.children,
    };
  };
}

function isRecordClassTreeNode(recordClass) {
  return function (node) {
    return (
      node.children.length !== 0 ||
      getRecordClassName(node) === recordClass.fullName
    );
  };
}
