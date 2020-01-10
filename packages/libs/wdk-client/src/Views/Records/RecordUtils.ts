import { partial, pick, values } from 'lodash';

import { CategoryTreeNode } from 'wdk-client/Utils/CategoryUtils';
import { Seq } from 'wdk-client/Utils/IterableUtils';
import { getPropertyValue, nodeHasProperty } from 'wdk-client/Utils/OntologyUtils';
import { filterItems } from 'wdk-client/Utils/SearchUtils';
import { filterNodes } from 'wdk-client/Utils/TreeUtils';
import { AttributeValue, RecordInstance, TableValue } from 'wdk-client/Utils/WdkModel';

type AttributeValueDict = Record<string, AttributeValue>;
type TableValueDict = Record<string, TableValue>;
type FilterSpec = {
  /** Search string */
  filterTerm: string;
  /** Record attributes to search in */
  filterAttributes: string[];
  /** Record tables to search in */
  filterTables: string[];
};

/**
 * Filter the results of an answer and return the filtered results.
 */
export function filterRecords(records: RecordInstance[], filterSpec: FilterSpec): RecordInstance[] {
  let { filterTerm, filterAttributes = [], filterTables = [] } = filterSpec;
  let getSearchableStringPartial = partial(getSearchableString, filterAttributes, filterTables);
  return filterItems(records, getSearchableStringPartial, filterTerm);
}

/**
 * Strip HTML characters from a string.
 */
export function stripHTML(str: string): string {
  let span = document.createElement('span');
  span.innerHTML = str;
  return span.textContent || '';
}

/**
 * Combine appropriate fields from the record into a searchable string.
 *
 * The approach here is pretty basic and probably ineffecient:
 *   - Convert all attribute values to an array of values.
 *   - Convert all table values to a flat array of values.
 *   - Combine the above arrays into a single array.
 *   - Join the array with a control character.
 *
 * There is much room for performance tuning here.
 */
export function getSearchableString(filterAttributes: string[], filterTables: string[], record: RecordInstance): string {
  let useAllTablesAndAttributes = filterAttributes.length === 0 && filterTables.length === 0;
  let attributes = useAllTablesAndAttributes ? record.attributes : pick(record.attributes, filterAttributes);
  let tables = useAllTablesAndAttributes ? record.tables : pick(record.tables, filterTables);
  return Seq.from(values(tables))
    .flatMap(rows => rows)
    .flatMap(row => Object.values(row))
    .concat(values(attributes))
    .flatMap(value =>
      value == null ? []
      : typeof value === 'object' ? [value.displayText || value.url]
      : [value] )
    .map(stripHTML)
    .join('\0');
}


// Category tree interactions
// --------------------------

const isInternalNode = partial(nodeHasProperty, 'scope', 'record-internal');
export const isNotInternalNode = partial(nodeHasProperty, 'scope', 'record');
const isAttributeNode = partial(nodeHasProperty, 'targetType', 'attribute');
const isTableNode = partial(nodeHasProperty, 'targetType', 'table');
const getAttributes = partial(filterNodes, isAttributeNode);
const getTables = partial(filterNodes, isTableNode);
const getNodeName = partial(getPropertyValue, 'name');

export function getAttributeNames(categoryTree: CategoryTreeNode): string[] {
  return getAttributes(categoryTree).map(getNodeName);
}

export function getTableNames(categoryTree: CategoryTreeNode): string[] {
  return getTables(categoryTree).map(getNodeName);
}

/** Creates a leaf predicate for the given recordClass */
export function isLeafFor(recordClassName: string) {
  return function isLeaf(node: CategoryTreeNode) {
    return (
      (isAttributeNode(node) || isTableNode(node))
      && nodeHasProperty('recordClassName', recordClassName, node)
      && (isInternalNode(node) || isNotInternalNode(node))
    );
  }
}
