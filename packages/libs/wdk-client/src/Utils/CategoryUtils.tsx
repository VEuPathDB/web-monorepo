import { get, kebabCase } from 'lodash';
import * as React from 'react';
import { safeHtml } from '../Utils/ComponentUtils';
import {
  getTree,
  nodeHasChildren,
  getNodeChildren,
  nodeHasProperty,
  getPropertyValue,
  getPropertyValues,
  OntologyNode,
  Ontology,
} from '../Utils/OntologyUtils';
import { areTermsInString } from '../Utils/SearchUtils';
import { Seq } from '../Utils/IterableUtils';
import { preorderSeq, getBranches } from '../Utils/TreeUtils';
import { Question, RecordClass } from '../Utils/WdkModel';
// import {Tooltip} from '@veupathdb/components/lib/components/widgets/Tooltip';

export type Dict<T> = {
  [key: string]: T;
};

export type TargetType = 'search' | 'attribute' | 'table';
export type Scope =
  | 'record'
  | 'record-internal'
  | 'results'
  | 'results-internal'
  | 'download'
  | 'download-internal';

export interface CategoryNodeProperties {
  targetType?: [TargetType];
  scope?: [Scope];
  label?: string[];
  name?: string[];
  'EuPathDB alternative term'?: string[];
  hasDefinition?: string[];
  hasNarrowSynonym?: string[];
  hasExactSynonym?: string[];
  recordClassName?: string[];
  recordClassUrlSegment?: string[];
}

export type CategoryNode = OntologyNode<{
  children: CategoryTreeNode[];
  properties: CategoryNodeProperties;
}>;

export type IndividualNode = OntologyNode<{
  children: CategoryTreeNode[]; // note, this is always empty for an individual
  properties: CategoryNodeProperties;
  wdkReference: {
    name: string;
    displayName: string;
    help?: string;
    summary?: string;
    description?: string;
  };
}>;

export type CategoryTreeNode = CategoryNode | IndividualNode;
export type CategoryOntology = Ontology<CategoryTreeNode>;

export const EMPTY_CATEGORY_TREE_NODE: CategoryTreeNode = {
  children: [],
  properties: {},
};

export function getId(node: CategoryTreeNode): string {
  return isIndividual(node)
    ? // FIXME Remove `fullName` hack when the urlSegment/name/fullName saga is resolved.
      node.wdkReference.name || (node.wdkReference as any).fullName
    : `category:${kebabCase(getLabel(node))}`;
}

export function getLabel(node: CategoryTreeNode) {
  return getPropertyValue('label', node);
}

export function getTargetType(node: CategoryTreeNode) {
  return getPropertyValue('targetType', node);
}

export function getScopes(node: CategoryTreeNode) {
  return getPropertyValues('scope', node);
}

export function getRefName(node: CategoryTreeNode) {
  return getPropertyValue('name', node);
}

export function getRecordClassName(node: CategoryTreeNode) {
  return getPropertyValue('recordClassName', node);
}

export function getRecordClassUrlSegment(node: CategoryTreeNode) {
  return getPropertyValue('recordClassUrlSegment', node);
}

export function getDisplayName(node: CategoryTreeNode) {
  return isIndividual(node)
    ? node.wdkReference.displayName
    : getPropertyValue('EuPathDB alternative term', node);
}

export function getDescription(node: CategoryTreeNode) {
  return isIndividual(node)
    ? node.wdkReference.help
    : getPropertyValue('hasDefinition', node);
}

export function getTooltipContent(node: CategoryTreeNode) {
  return isIndividual(node) && nodeHasProperty('targetType', 'search', node)
    ? node.wdkReference.summary
    : isIndividual(node) && nodeHasProperty('targetType', 'table', node)
    ? node.wdkReference.description
    : getDescription(node);
}

export function getFormattedTooltipContent(node: CategoryTreeNode) {
  const tooltipContent = getTooltipContent(node);

  return tooltipContent == null ? tooltipContent : safeHtml(tooltipContent);
}

export function getSynonyms(node: CategoryTreeNode) {
  return getPropertyValues('hasNarrowSynonym', node).concat(
    getPropertyValues('hasExactSynonym', node)
  );
}

export function getChildren(node: CategoryTreeNode) {
  return node.children;
}

// TODO Make this more genericL createCategoryNode and createWdkEntityNode (or, createLeafNode??)
/**
 * Returns a JSON object representing a simplified category tree node that will be properly interpreted
 * by the checkboxTreeController
 * @param id - name or id of the node
 * @param displayName - name to be displayed
 * @param description - tooltip
 * @returns {{properties: {targetType: string[], name: *[]}, wdkReference: {displayName: *, help: *}, children: Array}}
 */
export function createNode(
  id: string,
  displayName: string,
  description?: string,
  children: CategoryTreeNode[] = []
): CategoryTreeNode {
  return children.length > 0
    ? {
        properties: {
          label: [id],
          hasDefinition: description ? [description] : [],
          'EuPathDB alternative term': [displayName],
        },
        children,
      }
    : {
        properties: {
          targetType: ['attribute'],
          name: [id],
        },
        wdkReference: {
          name: id,
          displayName: displayName,
          help: description,
        },
        children,
      };
}

/**
 * Creates and adds a subtree to the given category tree containing the
 * question-specific (i.e. dynamic) attributes associated with the given
 * question.  The subtree is added as the first child.
 *
 * @param question question whose dynamic attributes should be added
 * @param categoryTree root node of a categories ontology tree to modify
 */
export function addSearchSpecificSubtree(
  question: Question,
  categoryTree: CategoryTreeNode
): CategoryTreeNode {
  if (question.dynamicAttributes.length > 0) {
    let questionNodes = question.dynamicAttributes
      .filter((attribute) => attribute.isDisplayable)
      .map((attribute) => {
        return createNode(
          attribute.name,
          attribute.displayName,
          attribute.help,
          []
        );
      });
    let subtree = createNode(
      'search_specific_subtree',
      'Search Specific',
      'Information about the records returned that is specific to the search you ran, and the parameters you specified',
      questionNodes
    );
    return Object.assign({}, categoryTree, {
      children: [subtree].concat(categoryTree.children),
    });
  }
  return categoryTree;
}

/**
 * Callback to provide the value/id of the node (i.e. checkbox value).  Using 'name' for
 * leaves and processed 'label' for branches
 * @param node - given id
 * @returns {*} - id/value of node
 */
export function getNodeId(node: CategoryTreeNode): string {
  return getId(node);
}

type QualifyingSpec = {
  [K in keyof CategoryNodeProperties]: string;
};

/**
 * Create a predicate function to filter out of the Categories ontology tree those items appropriate for the given
 * scope that identify attributes for the current record class.  In the case of the Transcript Record Class, a
 * distinction is made depending on whether the summary view applies to transcripts or genes.
 */
export function isQualifying(spec: QualifyingSpec) {
  return function (node: CategoryTreeNode) {
    // We have to cast spec as Record<string, string> to avoid an implicitAny error
    // See http://stackoverflow.com/questions/32968332/how-do-i-prevent-the-error-index-signature-of-object-type-implicitly-has-an-an
    return Object.keys(spec).every((prop) =>
      nodeHasProperty(prop, (spec as Record<string, string>)[prop] as any, node)
    );
  };
}

export function isIndividual(node: CategoryTreeNode): node is IndividualNode {
  const targetType = getTargetType(node);
  return (
    targetType === 'search' ||
    targetType === 'table' ||
    targetType === 'attribute'
  );
}

/**
 * Callback to provide a React element holding the display name and description for the node
 * @param node - given node
 * @returns {React.Element} - React element
 */
export function BasicNodeComponent(props: { node: CategoryTreeNode }) {
  return (
    /** Remove Tooltip for now as performance improvements are underway */
    // <Tooltip title={getDescription(props.node) ?? ''}>
    <span>{getDisplayName(props.node)}</span>
    // </Tooltip>
  );
}

/**
 * Returns whether the passed node 'matches' the passed node's display name
 * or description.
 *
 * @param node node to test
 * @param searchText search text to match against
 * @returns true if node 'matches' the passed search text
 */
export function nodeSearchPredicate(
  node: CategoryTreeNode,
  searchQueryTerms: string[]
): boolean {
  return areTermsInString(
    searchQueryTerms,
    getDisplayName(node) + ' ' + getTooltipContent(node)
  );
}

/**
 * Finds the "left-most" leaf in the tree and returns its ID using getNodeId()
 */
export function findFirstLeafId(ontologyTreeRoot: CategoryTreeNode): string {
  if (nodeHasChildren(ontologyTreeRoot)) {
    return findFirstLeafId(
      getNodeChildren(ontologyTreeRoot)[0] as CategoryTreeNode
    );
  }
  return getNodeId(ontologyTreeRoot);
}

/**
 * Returns an array of all the IDs of the leaf nodes in the passed tree.  If the
 * root has no children, this function assumes a "null" tree, and returns an empty array.
 */
export function getAllLeafIds(ontologyTreeRoot: CategoryTreeNode): string[] {
  return !nodeHasChildren(ontologyTreeRoot)
    ? []
    : getAllLeafIdsNoCheck(ontologyTreeRoot);
}

/**
 * Returns an array of all the IDs of the leaf nodes in the passed tree.
 */
function getAllLeafIdsNoCheck(ontologyTreeRoot: CategoryTreeNode): string[] {
  let collectIds = (leafIds: string[], node: CategoryTreeNode): string[] =>
    !nodeHasChildren(node)
      ? leafIds.concat(getNodeId(node))
      : getNodeChildren(node).reduce(collectIds, leafIds);
  return collectIds([], ontologyTreeRoot);
}

export function getAllBranchIds(categoryTree: CategoryTreeNode): string[] {
  return getBranches(
    categoryTree,
    (node: CategoryTreeNode) => node.children
  ).map(getNodeId);
}

// Utility functions for pruning categories

/**
 * Removed paths from tree that refer to unknown Wdk Model entities.
 */
export function pruneUnknownPaths(
  recordClasses: Dict<RecordClass>,
  questions: Dict<Question>,
  ontology: CategoryOntology
) {
  return Object.assign({}, ontology, {
    tree: getTree(ontology, isIndividualKnownWith(recordClasses, questions)),
  });
}

export function isIndividualKnownWith(
  recordClasses: Dict<RecordClass>,
  questions: Dict<Question>
) {
  return function isIndividualKnown(node: OntologyNode<{}>) {
    return getModelEntity(recordClasses, questions, node) !== undefined;
  };
}

/**
 * Adds the related WDK reference to each node. This function mutates the
 * ontology tree, which is ok since we are doing this before we cache the
 * result. It might be useful for this to return a new copy of the ontology
 * in the future, but for now this saves some performance.
 */
export function resolveWdkReferences(
  recordClasses: Dict<RecordClass>,
  questions: Dict<Question>,
  ontology: CategoryOntology
) {
  preorderSeq(ontology.tree).forEach((node) => {
    if (isIndividual(node)) {
      Object.assign(node, {
        wdkReference: getModelEntity(recordClasses, questions, node),
        properties: Object.assign(node.properties, {
          recordClassUrlSegment: [
            findRecordClassUrlSegment(recordClasses, node),
          ],
        }),
      });
    }
  });
  return ontology;
}

/**
 * Sort ontology node siblings. This function mutates the tree, so should
 * only be used before caching the ontology.
 */
export function sortOntology(
  recordClasses: Dict<RecordClass>,
  questions: Dict<Question>,
  ontology: CategoryOntology
) {
  const comparator = makeComparator(recordClasses, questions);
  preorderSeq(ontology.tree).forEach((node) => node.children.sort(comparator));
  return ontology;
}

interface NodeComparator {
  (nodeA: CategoryTreeNode, nodeB: CategoryTreeNode): number;
}

/** SORTING CATEGORY TREE
 * within each section (subsection,etc,  recursively):
 *  - first we sort alhabetically children by name
 *  - then we take those with "display order" to the top
 *  - finally we move any leaf child (table or attribute) before any subsection
 * So the end result is:
 *  - at the top, the tables and attributes sorted alphabetically (with the exception of "display order"-tagged children at the top)
 *  - followed by subsections, again sorted alphabetically (with display order ones at the top)
 */

/**
 * Compare nodes based on the "sort order" property. If it is undefined,
 * compare based on displayName.
 *
 */
function makeComparator(
  recordClasses: Dict<RecordClass>,
  questions: Dict<Question>
) {
  return composeComparators(
    compareByChildren,
    compareBySortNumber,
    makeCompareBySortName(recordClasses, questions)
  );
}

function composeComparators(...comparators: NodeComparator[]): NodeComparator {
  return function compareNodes(
    nodeA: CategoryTreeNode,
    nodeB: CategoryTreeNode
  ) {
    return (
      Seq.from(comparators)
        .map((comparator) => comparator(nodeA, nodeB))
        .find((n) => n !== 0) || 0
    );
  };
}

/**
 * Set subsections before leaves (tables,attributes or searches)
 * This makes the current record page section numbering system work
 */
function compareByChildren(nodeA: CategoryTreeNode, nodeB: CategoryTreeNode) {
  return nodeA.children.length === 0 && nodeB.children.length !== 0
    ? 1
    : nodeB.children.length === 0 && nodeA.children.length !== 0
    ? -1
    : 0;
}

function compareBySortNumber(nodeA: CategoryTreeNode, nodeB: CategoryTreeNode) {
  let sortOrderA = getPropertyValue('display order', nodeA);
  let sortOrderB = getPropertyValue('display order', nodeB);
  return sortOrderA && sortOrderB
    ? Number(sortOrderA) - Number(sortOrderB)
    : sortOrderA
    ? -1
    : sortOrderB
    ? 1
    : 0;
}

function makeCompareBySortName(
  recordClasses: Dict<RecordClass>,
  questions: Dict<Question>
) {
  return function compareBySortName(
    nodeA: CategoryTreeNode,
    nodeB: CategoryTreeNode
  ) {
    // attempt to sort by displayName
    let entityA = getModelEntity(recordClasses, questions, nodeA);
    let entityB = getModelEntity(recordClasses, questions, nodeB);
    let nameA =
      get(entityA, 'displayName') ||
      getPropertyValue('EuPathDB alternative term', nodeA) ||
      '';
    let nameB =
      get(entityB, 'displayName') ||
      getPropertyValue('EuPathDB alternative term', nodeA) ||
      '';
    return nameA.toLowerCase() < nameB.toLowerCase() ? -1 : 1;
  };
}

function getModelEntity(
  recordClasses: Dict<RecordClass>,
  questions: Dict<Question>,
  node: OntologyNode<{}>
) {
  const recordClass = recordClasses[getPropertyValue('recordClassName', node)];
  if (recordClass !== undefined) {
    const name = getRefName(node as CategoryTreeNode);
    switch (getTargetType(node as CategoryTreeNode)) {
      case 'attribute':
        return recordClass.attributesMap[name];
      case 'table':
        return recordClass.tablesMap[name];
      case 'search':
        return questions[name];
    }
  }
  return undefined;
}

function findRecordClassUrlSegment(
  recordClasses: Record<string, RecordClass>,
  node: OntologyNode<{}>
): string | undefined {
  const recordClass = recordClasses[getRecordClassName(node)];
  return recordClass && recordClass.urlSegment;
}
