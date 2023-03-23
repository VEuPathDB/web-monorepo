import { partial, pick, values } from 'lodash';

import { CategoryTreeNode } from '../../Utils/CategoryUtils';
import { stripHTML } from '../../Utils/DomUtils';
import { Seq } from '../../Utils/IterableUtils';
import { getPropertyValue, nodeHasProperty } from '../../Utils/OntologyUtils';
import { filterItems } from '../../Utils/SearchUtils';
import { filterNodes } from '../../Utils/TreeUtils';
import { RecordInstance } from '../../Utils/WdkModel';

type FilterSpec = {
  /** Search string */
  filterTerm: string;
  /** Record attributes to search in */
  filterAttributes: string[];
  /** Record tables to search in */
  filterTables: string[];
};

export interface PartialRecordRequest {
  attributes?: string[];
  tables?: string[];
}

/**
 * Filter the results of an answer and return the filtered results.
 */
export function filterRecords(
  records: RecordInstance[],
  filterSpec: FilterSpec
): RecordInstance[] {
  let { filterTerm, filterAttributes = [], filterTables = [] } = filterSpec;
  let getSearchableStringPartial = partial(
    getSearchableString,
    filterAttributes,
    filterTables
  );
  return filterItems(records, getSearchableStringPartial, filterTerm);
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
export function getSearchableString(
  filterAttributes: string[],
  filterTables: string[],
  record: RecordInstance
): string {
  let useAllTablesAndAttributes =
    filterAttributes.length === 0 && filterTables.length === 0;
  let attributes = useAllTablesAndAttributes
    ? record.attributes
    : pick(record.attributes, filterAttributes);
  let tables = useAllTablesAndAttributes
    ? record.tables
    : pick(record.tables, filterTables);
  return Seq.from(values(tables))
    .flatMap((rows) => rows)
    .flatMap((row) => Object.values(row))
    .concat(values(attributes))
    .flatMap((value) =>
      value == null
        ? []
        : typeof value === 'object'
        ? [value.displayText || value.url]
        : [value]
    )
    .map(stripHTML)
    .join('\0');
}

// Category tree interactions
// --------------------------

export const isInternalNode = partial(
  nodeHasProperty,
  'scope',
  'record-internal'
);
export const isNotInternalNode = partial(nodeHasProperty, 'scope', 'record');
export const isAttributeNode = partial(
  nodeHasProperty,
  'targetType',
  'attribute'
);
export const isTableNode = partial(nodeHasProperty, 'targetType', 'table');
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
      (isAttributeNode(node) || isTableNode(node)) &&
      nodeHasProperty('recordClassName', recordClassName, node) &&
      (isInternalNode(node) || isNotInternalNode(node))
    );
  };
}
