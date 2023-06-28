import { max, memoize, min, padStart, sortBy } from 'lodash';

import { Seq } from '../../Utils/IterableUtils';

import {
  Field,
  FieldTreeNode,
  TreeNode,
  Filter,
  FilterField,
  MultiField,
  MultiFilter,
  RangeField,
  ValueCounts,
} from '../../Components/AttributeFilter/Types';
import { preorderSeq, mapStructure } from '../../Utils/TreeUtils';

/**
 * Determine if a field should use a range filter display
 *
 * @param {Field} field
 */
export function isRange(field: Field): field is RangeField {
  return field.isRange === true;
}

export function isMulti(field: Field): field is MultiField {
  return field.type === 'multiFilter';
}

export function isFilterField(field: Field): field is FilterField {
  return field.type != null;
}

/**
 * Determine if a filter should be created, or if the values represent the default state.
 */
export function shouldAddFilter(
  filter: Filter,
  valueCounts: ValueCounts,
  selectByDefault: boolean
) {
  if (filter.type === 'multiFilter') {
    return filter.value.filters && filter.value.filters.length > 0;
  }
  if (selectByDefault == false) {
    if (filter.isRange) {
      return (
        filter.value != null &&
        (filter.value.min != null || filter.value.max !== null)
      );
    }
    return filter.value == null
      ? true
      : filter.value.length == 0
      ? filter.includeUnknown
      : true;
  }

  // user doesn't want unknowns
  if (!filter.includeUnknown) return true;

  // user wants everything except unknowns
  if (filter.value == null) return !filter.includeUnknown;

  if (filter.isRange)
    return filter.value.min == null && filter.value.max == null;

  return (
    filter.value.length !==
    valueCounts.filter((item) => item.value != null).length
  );
}

const dateStringRe = /^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?(T\d{2}:\d{2}:\d{2})?$/;

/**
 * Returns an strftime style format string.
 * @param {string} dateString
 */
export function getFormatFromDateString(dateString: string) {
  var matches = dateString.match(dateStringRe);
  if (matches == null) {
    throw new Error(
      `Expected a date string using the ISO 8601 format, but got "${dateString}".`
    );
  }
  var [, , m, d] = matches;
  return d !== undefined ? '%Y-%m-%d' : m !== undefined ? '%Y-%m' : '%Y';
}

/**
 * Returns a formatted date.
 *
 * @param {string} format strftime style format string
 * @param {Date} date
 */
export function formatDate(
  format: string,
  date: string | Date | number
): string {
  date =
    typeof date === 'string'
      ? parseDate(date)
      : typeof date === 'number'
      ? new Date(date)
      : date;
  return format
    .replace(/%Y/, String(date.getFullYear()))
    .replace(/%m/, padStart(String(date.getMonth() + 1), 2, '0'))
    .replace(/%d/, padStart(String(date.getDate()), 2, '0'));
}

interface NumberFormatOptions {
  /** If the number has more than 5 digits, use scientific notation */
  useScientificNotation?: boolean;
}

export function formatNumber(value: number, options?: NumberFormatOptions) {
  return options &&
    options.useScientificNotation &&
    Math.abs(value) < 0.01 &&
    value !== 0
    ? value.toExponential(2)
    : value.toLocaleString(undefined, {
        maximumFractionDigits: 2,
      });
}

/**
 * @param {string} dataString An ISO 8601 compatible date string.
 *   See https://en.wikipedia.org/wiki/ISO_8601.
 */
export function parseDate(dateString: string | Date | number): Date {
  if (dateString instanceof Date) return dateString;
  if (typeof dateString === 'number') return new Date(dateString);

  const [year, month = '1', day = '1'] = dateString.split(/\D/);
  return new Date(Number(year), Number(month) - 1, Number(day));
}

export function getFilterFieldsFromOntology(
  ontologyEntries: Iterable<Field>
): FilterField[] {
  return preorderSeq(getTree(ontologyEntries))
    .map((node) => node.field)
    .filter(isFilterField)
    .toArray();
}

type ParentTerm = string | undefined;

const makeOntologyNode =
  <T extends Field>(ontologyEntriesByParent: Map<ParentTerm, T[]>) =>
  (field: T): TreeNode<T> => {
    const childFields = ontologyEntriesByParent.get(field.term) || [];
    const children = childFields.map(makeOntologyNode(ontologyEntriesByParent));
    return { field, children };
  };

export const GENERATED_ROOT_FIELD: Field = {
  term: '@@root@@',
  display: '@@root@@',
};

export interface TreeOptions {
  hideSingleRoot: boolean;
}

export const defaultTreeOptions: TreeOptions = {
  hideSingleRoot: true,
};

export function getTree(
  ontologyEntries: Iterable<Field>,
  options: TreeOptions = defaultTreeOptions
): FieldTreeNode {
  return getGenericTree<Field>(ontologyEntries, GENERATED_ROOT_FIELD, options);
}

export function getGenericTree<T extends Field>(
  ontologyEntries: Iterable<T>,
  generatedRootField: T,
  options: TreeOptions = defaultTreeOptions
): TreeNode<T> {
  const entriesByParentTerm = mapBy(ontologyEntries, (term) => term.parent);
  const rootFields = entriesByParentTerm.get(undefined) || [];
  const rootChildren = rootFields.map(makeOntologyNode(entriesByParentTerm));

  // Return single root child, but only if it has children. Otherwise, we need
  // to place the single root beneath a generated root (below).
  return options.hideSingleRoot &&
    rootChildren.length == 1 &&
    rootChildren[0].children.length > 0
    ? rootChildren[0]
    : { field: generatedRootField, children: rootChildren };
}

export function getLeavesOfSubTree(
  ontologyEntries: Iterable<Field>,
  rootTerm: Field
): FilterField[] {
  const entriesByParentTerm = mapBy(
    ontologyEntries,
    (term) => term.parent
  ) as Map<string, Field[]>;
  let result = [] as FilterField[];
  let nodesToSearch = [rootTerm] as Field[];
  while (nodesToSearch.length > 0) {
    let nodesToSearchNext = [] as Field[];
    for (const node of nodesToSearch) {
      const children = entriesByParentTerm.get(node.term);
      if (children != null && children.length > 0) {
        nodesToSearchNext = nodesToSearchNext.concat(children);
      }
      if (isFilterField(node)) {
        result.push(node as FilterField);
      }
    }
    nodesToSearch = nodesToSearchNext;
  }
  return result;
}

export function removeIntermediateNodesWithSingleChild(
  node: FieldTreeNode
): FieldTreeNode {
  // We want to keep the subtree of any filter field (e.g., multifilter)
  if (isFilterField(node.field)) return node;
  if (node.children.length === 1)
    return removeIntermediateNodesWithSingleChild(node.children[0]);
  const children = node.children.map(removeIntermediateNodesWithSingleChild);
  return { ...node, children };
}

export function sortLeavesBeforeBranches(root: FieldTreeNode): FieldTreeNode {
  return mapStructure(sortNodeChildren, (node) => node.children, root);
}

function sortNodeChildren(
  node: FieldTreeNode,
  mappedChildren: FieldTreeNode[]
): FieldTreeNode {
  return {
    ...node,
    children: sortBy(mappedChildren, (entry) =>
      isFilterField(entry.field) ? -1 : 1
    ),
  };
}

function mapBy<T, S>(iter: Iterable<T>, keyAccessor: (item: T) => S) {
  return Seq.from(iter).reduce(function (map: Map<S, T[]>, item: T) {
    const key = keyAccessor(item);
    const itemArray = map.get(key) || [];
    itemArray.push(item);
    map.set(key, itemArray);
    return map;
  }, new Map<S, T[]>());
}

/**
 * Create an array of ancestor nodes for a given node predicate.
 */
export function findAncestorFields(
  tree: FieldTreeNode,
  term: string
): Seq<Field> {
  if (tree.field.term === term) return Seq.of(tree.field);
  const ancestors = Seq.from(tree.children).flatMap((child) =>
    findAncestorFields(child, term)
  );
  if (ancestors.isEmpty()) return Seq.empty();
  return Seq.of(tree.field).concat(ancestors);
}

// Formatting and display

/**
 * Creates a display string describing a filter.
 *
 * @param {Field} field
 * @param {any} value
 * @param {boolean} includeUnknown
 */
export function getFilterValueDisplay(filter: Filter): string {
  if (filter.type === 'multiFilter') {
    return filter.value.filters
      .map(getFilterValueDisplay)
      .join(filter.value.operation === 'union' ? ' OR ' : ' AND ');
  }
  if (filter.isRange) {
    let { value, includeUnknown } = filter;
    if (
      value != null &&
      value.min == null &&
      value.max == null &&
      includeUnknown == false
    ) {
      return 'No value selected';
    }

    const displayValue =
      value == null
        ? 'has a value'
        : value.min == null && value!.max == null
        ? ''
        : value.min == null
        ? `less than ${value.max}`
        : value.max == null
        ? `greater than ${value.min}`
        : `from ${value!.min} to ${value.max}`;
    return (
      displayValue +
      (includeUnknown
        ? displayValue
          ? ', or is unspecified'
          : 'unspecified'
        : '')
    );
  } else {
    let { value, includeUnknown } = filter;
    if (value != null && value.length === 0 && includeUnknown === false) {
      return 'No value selected';
    }
    return (
      (value == null ? 'has a value' : value.join(', ')) +
      (includeUnknown
        ? value && value.length === 0
          ? 'unspecified'
          : ', or is unspecified'
        : '')
    );
  }
}

export function getOperationDisplay(
  operation: MultiFilter['value']['operation']
) {
  switch (operation) {
    case 'union':
      return 'any';
    case 'intersect':
      return 'all';
  }
}

export const toPercentage = (num: number, denom: number) =>
  num == 0
    ? 0
    : num == denom
    ? 100
    : num != denom && (num / denom) * 100 > 99.4
    ? '>99'
    : num != denom && (num / denom) * 100 < 0.5
    ? '< 1'
    : Math.round((num / denom) * 100);
