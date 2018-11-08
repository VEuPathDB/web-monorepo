import { Action as ReduxAction } from 'redux';
import { from, Observable } from 'rxjs';
import { filter, mergeMap, takeUntil } from 'rxjs/operators';

import { State } from 'wdk-client/Views/AttributeAnalysis/BaseAttributeAnalysis/BaseAttributeAnalysisState';

import { EpicDependencies } from 'wdk-client/Core/Store';
import { PluginContext } from 'wdk-client/Utils/ClientPlugin';
import { Reporter } from 'wdk-client/Utils/WdkModel';
import { ServiceError } from 'wdk-client/Utils/WdkService';

// Actions
// -------

export type Action =
  | ChangeTablePageAction
  | ChangeTableRowsPerPageAction
  | CancelAttributeReportRequest
  | EndAttributeReportRequestErrorAction
  | EndAttributeReportRequestSuccessAction
  | ScopedAction
  | SearchTableAction
  | SelectTabAction
  | SortTableAction
  | StartAttributeReportRequestAction

//==============================================================================

// Scoped analysis action
export const SCOPED_ACTION = 'attribute-report/scoped-action';

export interface ScopedAction {
  type: typeof SCOPED_ACTION;
  payload: {
    action: ReduxAction,
    reporter: Reporter,
    stepId: number,
    context: PluginContext
  }
}

export function scopeAction(payload: ScopedAction['payload']): ScopedAction {
  return {
    type: SCOPED_ACTION,
    payload
  }
}

//==============================================================================

// Report requested

export const START_ATTRIBUTE_REPORT_REQUEST = 'attribute-report/start-request'

export interface StartAttributeReportRequestAction {
  type: typeof START_ATTRIBUTE_REPORT_REQUEST;
  payload: {
    stepId: number;
    reporterName: string;
  }
}

export function startAttributeReportRequest(stepId: number, reporterName: string): StartAttributeReportRequestAction {
  return {
    type: START_ATTRIBUTE_REPORT_REQUEST,
    payload: {
      reporterName,
      stepId
    }
  }
}

//==============================================================================

// Report success reposonse

export const END_ATTRIBUTE_REPORT_REQUEST_SUCCESS = 'attribute-report/end-request-success';

export interface EndAttributeReportRequestSuccessAction {
  type: typeof END_ATTRIBUTE_REPORT_REQUEST_SUCCESS;
  payload: {
    report: any;
  }
}

export function endAttributeReportRequestSuccess(report: any): EndAttributeReportRequestSuccessAction {
  return {
    type: END_ATTRIBUTE_REPORT_REQUEST_SUCCESS,
    payload: { report }
  }
}

//==============================================================================

// Report failed response

export const END_ATTRIBUTE_REPORT_REQUEST_ERROR = 'attribute-report/end-request-error';

export interface EndAttributeReportRequestErrorAction {
  type: typeof END_ATTRIBUTE_REPORT_REQUEST_ERROR;
  payload: {
    error: ServiceError;
  };
}

export function endAttributeReportRequestError(error: ServiceError): EndAttributeReportRequestErrorAction {
  return {
    type: END_ATTRIBUTE_REPORT_REQUEST_ERROR,
    payload: {
      error
    }
  }
}

//==============================================================================

// Report cancelled

export const CANCEL_ATTRIBUTE_REPORT_REQUEST = 'attribute-report/cancel-request';

export interface CancelAttributeReportRequest {
  type: typeof CANCEL_ATTRIBUTE_REPORT_REQUEST;
}

export function cancelAttributeReportRequest() {
  return { type: CANCEL_ATTRIBUTE_REPORT_REQUEST }
}

//==============================================================================

export const CHANGE_TABLE_PAGE = 'attribute-report/change-table-page';

export interface ChangeTablePageAction {
  type: typeof CHANGE_TABLE_PAGE;
  payload: number;
}

export function changeTablePage(page: number): ChangeTablePageAction {
  return {
    type: CHANGE_TABLE_PAGE,
    payload: page
  }
}

//==============================================================================

export const CHANGE_TABLE_ROWS_PER_PAGE = 'attribute-report/change-table-rows-per-page';

export interface ChangeTableRowsPerPageAction {
  type: typeof CHANGE_TABLE_ROWS_PER_PAGE;
  payload: number;
}

export function changeTableRowsPerPage(rowsPerPage: number): ChangeTableRowsPerPageAction {
  return {
    type: CHANGE_TABLE_ROWS_PER_PAGE,
    payload: rowsPerPage
  }
}

//==============================================================================

export const SORT_TABLE = 'attribute-report/sort-table';

interface Sorting {
  key: string;
  direction: 'asc' | 'desc';
}

export interface SortTableAction {
  type: typeof SORT_TABLE;
  payload: Sorting;
}

export function sortTable(sorting: Sorting): SortTableAction {
  return {
    type: SORT_TABLE,
    payload: sorting
  }
}

//==============================================================================

export const SEARCH_TABLE = 'attribute-report/search-table'

export interface SearchTableAction {
  type: typeof SEARCH_TABLE;
  payload: string;
}

export function searchTable(search: string): SearchTableAction {
  return {
    type: SEARCH_TABLE,
    payload: search
  }
}

//==============================================================================

export const SELECT_TAB = 'attribute-report/select-tab';

type Tab = 'table' | 'visualization';

export interface SelectTabAction {
  type: typeof SELECT_TAB;
  payload: Tab;
}

export function selectTab(tab: Tab): SelectTabAction {
  return {
    type: SELECT_TAB,
    payload: tab
  }
}

//==============================================================================

function isStartRequestAction(action: ReduxAction): action is StartAttributeReportRequestAction {
  return action.type === START_ATTRIBUTE_REPORT_REQUEST;
}

function isCancelRequestaction(action: ReduxAction): action is CancelAttributeReportRequest {
  return action.type === CANCEL_ATTRIBUTE_REPORT_REQUEST;
}

export function observeReportRequests<T extends string>(action$: Observable<ReduxAction>, state$: Observable<State<T>>, { wdkService }: EpicDependencies): Observable<ReduxAction> {
  return action$.pipe(
    filter(isStartRequestAction),
    mergeMap(({ payload: { reporterName, stepId }}) =>
      from(
        wdkService.getStepAnswer(stepId, { format: reporterName }).then(
          endAttributeReportRequestSuccess,
          endAttributeReportRequestError
        )).pipe(
          takeUntil(action$.pipe(filter(isCancelRequestaction))))
        )
      )
}
