import { max, memoize, min, padStart, sortBy } from 'lodash';

import { Seq } from '../../Utils/IterableUtils';

import {
  Field,
  FieldTreeNode,
  Filter,
  FilterField,
  MultiField,
  MultiFilter,
  RangeField,
  ValueCounts
} from './Types';
import { preorder, preorderSeq } from '../../Utils/TreeUtils';

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
export function shouldAddFilter(filter: Filter, valueCounts: ValueCounts, selectByDefault: boolean) {
  if (filter.type === 'multiFilter') {
    return filter.value.filters && filter.value.filters.length > 0;
  }
  if (selectByDefault == false) {
    if (filter.isRange) {
      return (
        filter.value != null &&
        ( filter.value.min != null ||
          filter.value.max !== null )
      );
    }
    return filter.value == null ? true
      : filter.value.length == 0 ? false
      : true;
  }

  // user doesn't want unknowns
  if (!filter.includeUnknown) return true;

  // user wants everything except unknowns
  if (filter.value == null) return !filter.includeUnknown;

  if (filter.isRange) {
    const values = valueCounts
      .filter(entry => entry.value != null)
      .map(entry => filter.type === 'number' ? Number(entry.value) : entry.value);

    // these type assertions are required since Array.prototype.filter does not narrow types.
    const summaryMin = min(values) as string | number;
    const summaryMax = max(values) as string | number;
    return (
      (filter.value.min == null && filter.value.max == null) ||
      (filter.value.min != null && filter.value.min > summaryMin) ||
      (filter.value.max != null && filter.value.max < summaryMax)
    );
  }

  return filter.value.length !== valueCounts.filter(item => item.value != null).length;
}

const dateStringRe = /^(\d{4})(?:-(\d{2})(?:-(\d{2}))?)?$/;

/**
 * Returns an strftime style format string.
 * @param {string} dateString
 */
export function getFormatFromDateString(dateString: string) {
  var matches = dateString.match(dateStringRe);
  if (matches == null) {
    throw new Error(`Expected a date string using the ISO 8601 format, but got "${dateString}".`);
  }
  var [ , , m, d ] = matches;
  return  d !== undefined ? '%Y-%m-%d'
    : m !== undefined ? '%Y-%m'
    : '%Y';
}

/**
 * Returns a formatted date.
 *
 * @param {string} format strftime style format string
 * @param {Date} date
 */
export function formatDate(format: string, date: string | Date) {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }
  return format
  .replace(/%Y/, String(date.getFullYear()))
  .replace(/%m/, padStart(String(date.getMonth() + 1), 2, '0'))
  .replace(/%d/, padStart(String(date.getDate()), 2, '0'));
}

export function getFilterFieldsFromOntology(ontologyEntries: Iterable<Field>): FilterField[] {
  return preorderSeq(getTree(ontologyEntries))
    .map(node => node.field)
    .filter(isFilterField)
    .toArray();
}

type ParentTerm = string | undefined;

export const getTree = memoize((ontologyEntries: Iterable<Field>): FieldTreeNode => {
  const entriesByParentTerm = mapBy(ontologyEntries, term => term.parent);
  const rootChildren = (entriesByParentTerm.has(undefined) ? entriesByParentTerm.get(undefined)! : [])
    .map(entry => makeOntologyNode(entry, entriesByParentTerm));

  // Return single root child, but only if it has children. Otherwise, we need
  // to place the single root beneath a generated root (below).
  if (rootChildren.length == 1 && rootChildren[0].children.length > 0) {
    return rootChildren[0];
  }

  return {
    field: {
      term: 'root',
      display: 'Root'
    },
    children: sortBy(rootChildren, entry => isFilterField(entry.field) ? -1 : 1)
  }
});

function makeOntologyNode(entry: Field, ontologyEntriesByParent: Map<ParentTerm, Field[]>): FieldTreeNode {
  const children = (ontologyEntriesByParent.has(entry.term) ? ontologyEntriesByParent.get(entry.term)! : [])
    .map(e => makeOntologyNode(e, ontologyEntriesByParent));
  return {
    field: entry,
    children: sortBy(children, entry => isFilterField(entry.field) ? -1 : 1)
  };
}

function mapBy<T, S>(iter: Iterable<T>, keyAccessor: (item: T) => S) {
  return Seq.from(iter)
    .reduce(function(map: Map<S, T[]>, item: T) {
      const key = keyAccessor(item);
      const itemArray = map.get(key) || [];
      itemArray.push(item);
      map.set(key, itemArray);
      return map;
    }, new Map<S, T[]>());
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
    return filter.value.filters.map(getFilterValueDisplay)
      .join(filter.value.operation === 'union' ? ' OR ' : ' AND ')
  }
  if (filter.isRange) {
    let { value, includeUnknown } = filter;
    if (value != null && value.min == null && value.max == null && includeUnknown == false) {
      return 'No value selected';
    }

    const displayValue = value == null ? 'has a value'
                       : value.min == null && value!.max == null ? ''
                       : value.min == null ? `less than ${value.max}`
                       : value.max == null ? `greater than ${value.min}`
                       : `from ${value!.min} to ${value.max}`;
    return displayValue +
      (includeUnknown ? ( displayValue ? ', or is unspecified' : 'unspecified') : '');
  }

  else {
    let { value, includeUnknown } = filter;
    if (value != null && value.length === 0 && includeUnknown === false) {
      return 'No value selected'
    }
    return (value == null ? 'has a value' : value.join(', ')) +
      (includeUnknown ? (value && value.length === 0 ? 'unspecified' : ', or is unspecified') : '');
  }
}

export function getOperationDisplay(operation: MultiFilter['value']['operation']) {
  switch(operation) {
    case 'union': return 'any';
    case 'intersect': return 'all';
  }
}
