import { Action as ReduxAction, Reducer, combineReducers } from 'redux';
import { ServiceError } from 'wdk-client/Utils/WdkService';

import { Action } from 'wdk-client/Actions';
import {
  CANCEL_ATTRIBUTE_REPORT_REQUEST,
  END_ATTRIBUTE_REPORT_REQUEST_ERROR,
  END_ATTRIBUTE_REPORT_REQUEST_SUCCESS,
  START_ATTRIBUTE_REPORT_REQUEST,
  CHANGE_TABLE_PAGE,
  SORT_TABLE,
  SEARCH_TABLE,
  SELECT_TAB,
  CHANGE_TABLE_ROWS_PER_PAGE,
  EndAttributeReportRequestSuccessAction
} from 'wdk-client/Actions/AttributeAnalysisActions';


// Report state
// ------------

export enum Status {
  Idle = 'idle',
  Fetching = 'fetching',
  Error = 'error',
  Success = 'success'
}

type InitialState = { status: Status.Idle };
type FetchingState = { status: Status.Fetching };
type ErrorState = { status: Status.Error, error: ServiceError };
type SuccessState = { status: Status.Success, report: any };

type ReportState = InitialState | FetchingState | ErrorState | SuccessState;

function reduceReport(state: ReportState = { status: Status.Idle}, action: Action): ReportState {
  switch (action.type) {
    case START_ATTRIBUTE_REPORT_REQUEST:
      return { status: Status.Fetching };
    case END_ATTRIBUTE_REPORT_REQUEST_SUCCESS:
      return { status: Status.Success, report: action.payload.report };
    case END_ATTRIBUTE_REPORT_REQUEST_ERROR:
      return { status: Status.Error, error: action.payload.error };
    case CANCEL_ATTRIBUTE_REPORT_REQUEST:
      return { status: Status.Idle };
    default:
      return state;
  }
}


// Table state
// -----------

type TableState<T extends string> = {
  sort: { key: T; direction: 'asc' | 'desc'; }
  search: string;
  currentPage: number;
  rowsPerPage: number;
}

const makeReduceTable = <T extends string>(init: TableState<T>) => (state: TableState<T> = init, action: Action): TableState<T> => {
  switch (action.type) {
    case CANCEL_ATTRIBUTE_REPORT_REQUEST:
      return init;
    case CHANGE_TABLE_PAGE:
      return { ...state, currentPage: action.payload };
    case CHANGE_TABLE_ROWS_PER_PAGE:
      return { ...state, currentPage: 1, rowsPerPage: action.payload };
    case SORT_TABLE:
      return { ...state, currentPage: 1, sort: action.payload as TableState<T>['sort'] };
    case SEARCH_TABLE:
      return { ...state, currentPage: 1, search: action.payload };
    default:
      return state;
  }
};


// Tabs state
// ----------

type TabsState = {
  activeTab: 'table' | 'visualization';
}

const initTabState: TabsState = {
  activeTab: 'visualization'
}

function reduceTabs(state: TabsState = initTabState, action: Action): TabsState {
  switch(action.type) {
    case CANCEL_ATTRIBUTE_REPORT_REQUEST: return { activeTab: 'visualization' };
    case SELECT_TAB: return { ...state, activeTab: action.payload };
    default: return state;
  }
}

// Composite state
// ---------------

export type State<T extends string, S = {}> = {
  data: ReportState;
  table: TableState<T>;
  tabs: TabsState;
  visualization: S;
}

export const makeReduce = <
  T extends string,
  VisualizationState,
  VisualizationAction extends ReduxAction
>(
  initTableSortColumn: T,
  reduceVisualization: Reducer<VisualizationState, EndAttributeReportRequestSuccessAction | VisualizationAction>
): Reducer<State<T, VisualizationState>, Action> =>
  combineReducers({
    data: reduceReport,
    table: makeReduceTable<T>({
      currentPage: 1,
      rowsPerPage: 100,
      search: '',
      sort: {
        key: initTableSortColumn,
        direction: 'asc'
      }
    }),
    tabs: reduceTabs,
    visualization: reduceVisualization
  });
