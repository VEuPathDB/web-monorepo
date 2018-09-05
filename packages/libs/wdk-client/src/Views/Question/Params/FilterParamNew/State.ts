import { groupBy, isEqual, mapValues } from 'lodash';

import { Filter, MemberFilter, OntologyTermSummary } from '../../../../Components/AttributeFilter/Types';
import { matchAction, Reducer } from '../../../../Utils/ReducerUtils';

import {
  ActiveFieldSetAction,
  FieldStateUpdatedAction,
  FiltersUpdatedAction,
  OntologyTermsInvalidated,
  SummaryCountsLoadedAction,
} from './ActionCreators';
import { sortDistribution } from './Utils';


export type SortSpec = {
  groupBySelected: boolean;
  columnKey: keyof OntologyTermSummary['valueCounts'][number];
  direction: 'asc' | 'desc';
};

type BaseFieldState = {
  summary?: OntologyTermSummary;
  loading?: boolean;
  invalid?: boolean;
  errorMessage?: string;
}

export type MemberFieldState = BaseFieldState & {
  sort: SortSpec;
  searchTerm: string;
}

export type RangeFieldState = BaseFieldState & {
  yaxisMax?: number;
  xaxisMin?: number;
  xaxisMax?: number;
}

export type FieldState = MemberFieldState | RangeFieldState;

export type State = Readonly<{
  errorMessage?: string;
  loading?: boolean;
  activeOntologyTerm?: string;
  hideFilterPanel?: boolean;
  hideFieldPanel?: boolean;
  fieldStates: Readonly<Record<string, FieldState>>;
  filteredCount?: number;
  unfilteredCount?: number;
  loadingFilteredCount: boolean;
}>;

export type Value = {
  filters: Filter[]
}

const initialState: State = {
  fieldStates: {},
  loadingFilteredCount: false
}

// FIXME Set loading and error statuses on ontologyTermSummaries entries
export const reduce = <Reducer<State>>matchAction(initialState,
  [ActiveFieldSetAction, (state, { activeField }) => ({
    ...state,
    activeOntologyTerm: activeField,
    fieldStates: state.fieldStates[activeField] == null ? {
      ...state.fieldStates,
      [activeField]: {}
    } : state.fieldStates
  })],
  [SummaryCountsLoadedAction, (state, { nativeFiltered, nativeUnfiltered }) => ({
    ...state,
    loadingFilteredCount: false,
    filteredCount: nativeFiltered,
    unfilteredCount: nativeUnfiltered
  })],
  [FieldStateUpdatedAction, (state, { field, fieldState }) => ({
    ...state,
    fieldStates: {
      ...state.fieldStates,
      [field]: {
        ...state.fieldStates[field],
        ...fieldState
      }
    }
  })],
  [FiltersUpdatedAction, (state, { prevFilters, filters }) => ({
    ...state,
    loadingFilteredCount: true,
    fieldStates: handleFilterChange(state, prevFilters, filters)
  })],
  [OntologyTermsInvalidated, (state, { retainedFields }) => ({
    ...state,
    fieldStates: mapValues(state.fieldStates, (fieldState, key) =>
      retainedFields.includes(key)
        ? fieldState
        : {
          ...fieldState,
          invalid: true
        })
  })]
);

function handleFilterChange(state: State, prevFilters: Filter[], filters: Filter[]) {
  // Get an array of fields whose associated filters have been modified.
  // Concat prev and new filters arrays, then group them by field name
  const modifiedFields = new Set(Object.entries(groupBy(filters.concat(prevFilters), 'field'))
    // keep filters if prev and new are not equal, or if there is only one for a field name (e.g., added/removed)
    .filter(([, filters]) => filters.length === 1 || !isEqual(filters[0], filters[1]))
    .map(([field]) => field));

  return mapValues(state.fieldStates, (fieldState, fieldTerm) => {
    if (modifiedFields.size > 2 || fieldTerm !== state.activeOntologyTerm) {
      fieldState = {
        ...fieldState,
        summary: undefined
      }
    }
    if (isMemberFieldState(fieldState) && fieldState.summary && fieldState.sort.groupBySelected) {
      fieldState = {
        ...fieldState,
        summary: {
          ...fieldState.summary,
          valueCounts: sortDistribution(
            fieldState.summary.valueCounts,
            fieldState.sort,
            filters.find(filter => filter.field === fieldTerm) as MemberFilter
          )
        }
      }
    }
    return fieldState;
  })
}

function isMemberFieldState(fieldState: FieldState): fieldState is MemberFieldState {
  return (fieldState as MemberFieldState).sort !== undefined;
}
