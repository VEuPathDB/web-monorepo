import { Filter } from 'wdk-client/Components/AttributeFilter/Types';
import { FilterParamNew } from 'wdk-client/Utils/WdkModel';

import { Context } from 'wdk-client/Views/Question/Params/Utils';
import { FieldState } from 'wdk-client/Views/Question/Params/FilterParamNew/State';

type Ctx = Context<FilterParamNew>

export type Action =
  | SetActiveFieldAction
  | SummaryCountsLoadedAction
  | UpdateFieldStateAction
  | UpdateFiltersAction
  | InvalidateOntologyTermsAction


// Actions
// -------

//==============================================================================

export const SET_ACTIVE_FIELD = 'filter-param-new/set-active-field';

export interface SetActiveFieldAction {
  type: typeof SET_ACTIVE_FIELD;
  payload: Ctx & {
    activeField: string;
  };
}

export function setActiveField(payload: SetActiveFieldAction['payload']): SetActiveFieldAction {
  return {
    type: SET_ACTIVE_FIELD,
    payload
  };
}

//==============================================================================

export const SUMMARY_COUNTS_LOADED = 'filter-param-new/summary-counts-loaded';

export interface SummaryCountsLoadedAction {
  type: typeof SUMMARY_COUNTS_LOADED;
  payload: Ctx & {
    filtered: number;
    unfiltered: number;
    nativeFiltered: number;
    nativeUnfiltered: number;
  };
}

export function summaryCountsLoaded(payload: SummaryCountsLoadedAction['payload']): SummaryCountsLoadedAction {
  return {
    type: SUMMARY_COUNTS_LOADED,
    payload
  };
}

//==============================================================================

export const UPDATE_FIELD_STATE = 'filter-param-new/update-field-state';

export interface UpdateFieldStateAction {
  type: typeof UPDATE_FIELD_STATE;
  payload: Ctx & {
    field: string;
    fieldState: FieldState;
  };
}

export function updateFieldState(payload: UpdateFieldStateAction['payload']): UpdateFieldStateAction {
  return {
    type: UPDATE_FIELD_STATE,
    payload
  };
}

//==============================================================================

export const UPDATE_FILTERS = 'filter-param-new/update-filters';

export interface UpdateFiltersAction {
  type: typeof UPDATE_FILTERS;
  payload: Ctx & {
    prevFilters: Filter[];
    filters: Filter[];
  };
}

export function updateFilters(payload: UpdateFiltersAction['payload']): UpdateFiltersAction {
  return {
    type: UPDATE_FILTERS,
    payload
  };
}

//==============================================================================

export const INVALIDATE_ONTOLOGY_TERMS = 'filter-param-new/invalidate-ontology-terms';

export interface InvalidateOntologyTermsAction {
  type: typeof INVALIDATE_ONTOLOGY_TERMS;
  payload: Ctx & {
    retainedFields: string[];
    activeOntologyTerm: string;
  };
}

export function invalidateOntologyTerms(payload: InvalidateOntologyTermsAction['payload']): InvalidateOntologyTermsAction {
  return {
    type: INVALIDATE_ONTOLOGY_TERMS,
    payload
  };
}

//==============================================================================
