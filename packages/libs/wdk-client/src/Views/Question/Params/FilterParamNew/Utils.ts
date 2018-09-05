import { memoize, sortBy, stubTrue as T } from 'lodash';
import natsort from 'natural-sort';

import { Filter, MemberFilter, ValueCounts } from '../../../../Components/AttributeFilter/Types';
import { getTree, isRange } from '../../../../Components/AttributeFilter/Utils';
import { Seq } from '../../../../Utils/IterableUtils';
import { preorderSeq } from '../../../../Utils/TreeUtils';
import { FilterParamNew, Parameter } from '../../../../Utils/WdkModel';

import { SortSpec, State } from './State';
import { Context } from '../Utils';

const natSortComparator = (natsort as any)();

export function isType(parameter: Parameter): parameter is FilterParamNew {
  return parameter.type === 'FilterParamNew';
}

export function isParamValueValid(context: Context<FilterParamNew>, state: State) {
  return (
    state.filteredCount == null ||
    context.parameter.minSelectedCount <= state.filteredCount
  );
}

export function getLeaves(ontology: FilterParamNew['ontology']) {
  return Seq.from(preorderSeq(getTree(ontology)))
    .filter(n => n.children.length === 0);
}

export function findFirstLeaf(ontology: FilterParamNew['ontology']): string {
  return getLeaves(ontology).map(n => n.field.term).first();
}

export const getFilters = memoize(function(paramValue: string) {
  const parsedValue: { filters: Filter[] } = JSON.parse(paramValue);
  return parsedValue.filters;
})


/**
 * Compare distribution values using a natural comparison algorithm.
 * @param {string|null} valueA
 * @param {string|null} valueB
 */
function compareDistributionValues(valueA: any, valueB: any) {
  return natSortComparator(
    valueA == null ? '' : valueA,
    valueB == null ? '' : valueB
  );
}


type Entry = ValueCounts[number];

function filteredCountIsZero(entry: Entry) {
  return entry.filteredCount === 0;
}

/**
 * Sort distribution based on sort spec. `SortSpec` is an object with two
 * properties: `columnKey` (the distribution property to sort by), and
 * `direction` (one of 'asc' or 'desc').
 * @param {Distribution} distribution
 * @param {SortSpec} sort
 */
export function sortDistribution(distribution: ValueCounts, sort: SortSpec, filter?: MemberFilter) {
  const { columnKey, direction, groupBySelected } = sort;
  const selectedSet = new Set(filter ? filter.value : [] as Array<string|number|null>);
  const selectionPred = groupBySelected
    ? (a: Entry) => !selectedSet.has(a.value)
    : T

  // first sort by specified column
  const primarySorted = distribution.slice().sort(function (a: Entry, b: Entry) {
    const order =
      // when column values are equal, sort by value
      columnKey === 'value' || a[columnKey] === b[columnKey]
        ? compareDistributionValues(a.value, b.value)
        : a[columnKey] > b[columnKey] ? 1 : -1;
    return direction === 'desc' ? -order : order;
  });

  // then perform secondary sort based on filtered count and selection
  return sortBy(primarySorted, [ filteredCountIsZero, selectionPred ]);
}

export function isMemberField(parameter: FilterParamNew, fieldName: string) {
  const field = parameter.ontology.find(field => field.term === fieldName);
  if (field == null) {
    throw new Error("Could not find a field with the term `" + fieldName + "`.");
  }
  return isRange(field) === false;
}
