import { groupBy, isEqual, mapValues } from 'lodash';

import {
  Filter,
  MemberFilter,
  OntologyTermSummary,
} from '../../../../Components/AttributeFilter/Types';

import {
  SET_ACTIVE_FIELD,
  UPDATE_FIELD_STATE,
  UPDATE_FILTERS,
  INVALIDATE_ONTOLOGY_TERMS,
  SUMMARY_COUNTS_LOADED,
} from '../../../../Actions/FilterParamActions';
import { sortDistribution } from '../../../../Views/Question/Params/FilterParamNew/FilterParamUtils';
import { Action } from '../../../../Actions';

export type SortSpec = {
  groupBySelected: boolean;
  columnKey: keyof OntologyTermSummary['valueCounts'][number];
  direction: 'asc' | 'desc';
};

export type MultiFieldSortSpec = {
  columnKey: 'display' | keyof OntologyTermSummary['valueCounts'];
  direction: 'asc' | 'desc';
};

type OntologySummaryAndTerm = OntologyTermSummary & {
  term: any;
};
type BaseFieldState = {
  summary?: OntologyTermSummary;
  loading?: boolean;
  invalid?: boolean;
  errorMessage?: string;
};

export type MemberFieldState = BaseFieldState & {
  sort: SortSpec;
  searchTerm: string;
  currentPage: number;
  rowsPerPage: number;
};

export type MultiFieldState = BaseFieldState & {
  sort: MultiFieldSortSpec;
  leafSummaries: OntologySummaryAndTerm[];
  searchTerm: string;
};

export type RangeFieldState = BaseFieldState & {
  yaxisMax?: number;
  xaxisMin?: number;
  xaxisMax?: number;
};

export type FieldState = MemberFieldState | RangeFieldState | MultiFieldState;

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
  filters: Filter[];
};

const initialState: State = {
  fieldStates: {},
  loadingFilteredCount: false,
};

// FIXME Set loading and error statuses on ontologyTermSummaries entries
export function reduce(state: State = initialState, action: Action): State {
  switch (action.type) {
    case SET_ACTIVE_FIELD:
      return {
        ...state,
        activeOntologyTerm: action.payload.activeField,
        fieldStates:
          state.fieldStates[action.payload.activeField] == null
            ? {
                ...state.fieldStates,
                [action.payload.activeField]: {},
              }
            : state.fieldStates,
      };
    case SUMMARY_COUNTS_LOADED:
      return {
        ...state,
        loadingFilteredCount: false,
        filteredCount: action.payload.nativeFiltered,
        unfilteredCount: action.payload.nativeUnfiltered,
      };

    case UPDATE_FIELD_STATE:
      return {
        ...state,
        fieldStates: {
          ...state.fieldStates,
          [action.payload.field]: {
            ...state.fieldStates[action.payload.field],
            ...action.payload.fieldState,
          },
        },
      };

    case UPDATE_FILTERS:
      return {
        ...state,
        loadingFilteredCount: true,
        fieldStates: handleFilterChange(
          state,
          action.payload.prevFilters,
          action.payload.filters
        ),
      };

    case INVALIDATE_ONTOLOGY_TERMS:
      return {
        ...state,
        activeOntologyTerm: action.payload.activeOntologyTerm,
        fieldStates: mapValues(state.fieldStates, (fieldState, key) =>
          action.payload.retainedFields.includes(key)
            ? fieldState
            : {
                ...fieldState,
                invalid: true,
              }
        ),
      };

    default:
      return state;
  }
}

function handleFilterChange(
  state: State,
  prevFilters: Filter[],
  filters: Filter[]
) {
  // Get an array of fields whose associated filters have been modified.
  // Concat prev and new filters arrays, then group them by field name
  const modifiedFields = new Set(
    Object.entries(groupBy(filters.concat(prevFilters), 'field'))
      // keep filters if prev and new are not equal, or if there is only one for a field name (e.g., added/removed)
      .filter(
        ([, filters]) =>
          filters.length === 1 || !isEqual(filters[0], filters[1])
      )
      .map(([field]) => field)
  );

  return mapValues(state.fieldStates, (fieldState, fieldTerm) => {
    if (modifiedFields.size > 2 || fieldTerm !== state.activeOntologyTerm) {
      fieldState = {
        ...fieldState,
        summary: undefined,
      };
    }
    if (
      isMemberFieldState(fieldState) &&
      fieldState.summary &&
      fieldState.sort.groupBySelected
    ) {
      fieldState = {
        ...fieldState,
        summary: {
          ...fieldState.summary,
          valueCounts: sortDistribution(
            fieldState.summary.valueCounts,
            fieldState.sort,
            filters.find((filter) => filter.field === fieldTerm) as MemberFilter
          ),
        },
      };
    }
    return fieldState;
  });
}

function isMemberFieldState(
  fieldState: FieldState
): fieldState is MemberFieldState {
  return (fieldState as MemberFieldState).sort !== undefined;
}
