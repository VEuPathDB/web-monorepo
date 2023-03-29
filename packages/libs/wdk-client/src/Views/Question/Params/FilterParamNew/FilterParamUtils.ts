import { reverse, memoize, sortBy, stubTrue as T } from 'lodash';
import natsort from 'natural-sort';

import {
  OntologyTermSummary,
  Filter,
  MemberFilter,
  ValueCounts,
  FieldTreeNode,
} from '../../../../Components/AttributeFilter/Types';
import {
  getTree,
  isRange,
  removeIntermediateNodesWithSingleChild,
  isFilterField,
  sortLeavesBeforeBranches,
} from '../../../../Components/AttributeFilter/AttributeFilterUtils';
import { preorderSeq } from '../../../../Utils/TreeUtils';
import { FilterParamNew, Parameter } from '../../../../Utils/WdkModel';

import {
  SortSpec,
  MultiFieldSortSpec,
  MultiFieldState,
  State,
} from '../../../../Views/Question/Params/FilterParamNew/State';
import { Context } from '../../../../Views/Question/Params/Utils';

const natSortComparator = (natsort as any)();

export function isType(parameter: Parameter): parameter is FilterParamNew {
  return parameter.type === 'filter';
}

export function isParamValueValid(
  context: Context<FilterParamNew>,
  state: State
) {
  return (
    state.filteredCount == null ||
    context.parameter.minSelectedCount <= state.filteredCount
  );
}

export function getOntologyTree(param: FilterParamNew): FieldTreeNode {
  let tree = getTree(param.ontology);
  if (param.hideEmptyOntologyNodes)
    tree = removeIntermediateNodesWithSingleChild(tree);
  if (param.sortLeavesBeforeBranches) tree = sortLeavesBeforeBranches(tree);
  return tree;
}

export function getFilterFields(param: FilterParamNew) {
  return preorderSeq(getOntologyTree(param))
    .map((n) => n.field)
    .filter(isFilterField);
}

export const getFilters = memoize(function (paramValue: string) {
  const parsedValue: { filters: Filter[] } = JSON.parse(paramValue);
  return parsedValue.filters;
});

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

export function sortMultiFieldSummary(
  summaries: MultiFieldState['leafSummaries'],
  ontology: any[],
  sort: MultiFieldSortSpec
): MultiFieldState['leafSummaries'] {
  if (sort == null) return summaries;
  const fields = new Map(ontology.map((o) => [o.term, o]));
  const sortedSummaries = sortBy(summaries, (entry) =>
    sort.columnKey === 'display'
      ? fields.get(entry.term)?.display
      : entry.valueCounts[sort.columnKey]
  ) as MultiFieldState['leafSummaries'];
  return sort.direction === 'asc' ? sortedSummaries : reverse(sortedSummaries);
}
/**
 * Sort distribution based on sort spec. `SortSpec` is an object with two
 * properties: `columnKey` (the distribution property to sort by), and
 * `direction` (one of 'asc' or 'desc').
 * @param {Distribution} distribution
 * @param {SortSpec} sort
 */
export function sortDistribution(
  distribution: ValueCounts,
  sort: SortSpec,
  filter?: MemberFilter
) {
  const { columnKey, direction, groupBySelected } = sort;
  const selectedSet = new Set(
    filter ? filter.value : ([] as Array<string | number | null>)
  );
  const selectionPred = groupBySelected
    ? (a: Entry) => !selectedSet.has(a.value)
    : T;

  // first sort by specified column
  const primarySorted = distribution
    .slice()
    .sort(function (a: Entry, b: Entry) {
      const order =
        // when column values are equal, sort by value
        columnKey === 'value' || a[columnKey] === b[columnKey]
          ? compareDistributionValues(a.value, b.value)
          : a[columnKey] > b[columnKey]
          ? 1
          : -1;
      return direction === 'desc' ? -order : order;
    });

  // then perform secondary sort based on filtered count and selection
  return sortBy(primarySorted, [filteredCountIsZero, selectionPred]);
}

export function isMemberField(parameter: FilterParamNew, fieldName: string) {
  const field = parameter.ontology.find((field) => field.term === fieldName);
  if (field == null) {
    throw new Error(
      'Could not find a field with the term `' + fieldName + '`.'
    );
  }
  return isRange(field) === false;
}
