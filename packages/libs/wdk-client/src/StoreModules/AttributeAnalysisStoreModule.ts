import {Action} from 'wdk-client/Actions';
import {
  requestAttributeReport,
  fulfillAttributeReport,
  openAttributeAnalysis,
  closeAttributeAnalysis,
  errorAttributeReport,
  changeTablePage,
  changeTableRowsPerPage,
  searchTable,
  sortTable,
  selectTab,
} from 'wdk-client/Actions/AttributeAnalysisActions';
import {EpicDependencies} from 'wdk-client/Core/Store';
import {combineReducers} from 'redux';
import {StateObservable} from 'redux-observable';
import {
  InferAction,
  switchMapRequestActionsToEpic,
  takeEpicInWindow,
} from 'wdk-client/Utils/ActionCreatorUtils';
import { RootState } from 'wdk-client/Core/State/Types';
import {ResultType, getCustomReport} from 'wdk-client/Utils/WdkResult';

export const key = 'attributeAnalysis';

// State and Reducer
// -----------------

interface ReportState {
  resource: object | undefined;
  error: Error | undefined;
  loading: boolean;
  activeAnalysis?: {
    resultType: ResultType;
    reporterName: string
  };
}

const initialReportState: ReportState = {
  resource: undefined,
  error: undefined,
  loading: false,
};

function reportReducer(
  state: ReportState = initialReportState,
  action: Action,
): ReportState {
  switch (action.type) {
    case openAttributeAnalysis.type:
      return {...state, activeAnalysis: action.payload};

    case requestAttributeReport.type:
      return {...state, loading: true};

    case fulfillAttributeReport.type:
      return {...state, loading: false, resource: action.payload.report};

    case errorAttributeReport.type:
      return {...state, loading: false, error: action.payload.error};

    case closeAttributeAnalysis.type:
      return initialReportState;

    default:
      return state;
  }
}

interface TableState {
  sort: {key: string; direction: 'asc' | 'desc'};
  search: string;
  currentPage: number;
  rowsPerPage: number;
}

const initialTableState: TableState = {
  sort: {key: 'value', direction: 'asc'},
  search: '',
  currentPage: 1,
  rowsPerPage: 100,
};

function tableReducer(
  state: TableState = initialTableState,
  action: Action,
): TableState {
  switch (action.type) {
    case changeTablePage.type:
      return {...state, currentPage: action.payload.page};

    case changeTableRowsPerPage.type:
      return {...state, rowsPerPage: action.payload.rowsPerPage};

    case searchTable.type:
      return {...state, search: action.payload.searchString };

    case sortTable.type:
      return {...state, sort: action.payload};

    case closeAttributeAnalysis.type:
      return initialTableState;

    default:
      return state;
  }
}

type TabsState = 'table' | 'visualization';

const initialTabsState: TabsState = 'visualization';

function tabsReducer(
  state: TabsState = initialTabsState,
  action: Action,
): TabsState {
  switch (action.type) {
    case selectTab.type:
      return action.payload.tab;

    case closeAttributeAnalysis.type:
      return initialTabsState;

    default:
      return state;
  }
}

export interface AnalysisState {
  report: ReportState;
  table: TableState;
  activeTab: TabsState;
}

export type State = AnalysisState;

export const reduce = combineReducers<State, Action>({
  report: reportReducer,
  table: tableReducer,
  activeTab: tabsReducer,
});

// Observe
// -------

async function getAttributeReport(
  [requestReportAction]: [InferAction<typeof requestAttributeReport>],
  state$: StateObservable<RootState>,
  {wdkService}: EpicDependencies,
) {
  const {reporterName, resultType, config} = requestReportAction.payload;
  try {
    const report = await getCustomReport(wdkService, resultType, {format: reporterName, formatConfig: config});
    return fulfillAttributeReport(reporterName, resultType, report);
  }
  catch (error) {
    return errorAttributeReport(reporterName, resultType, error);
  }
}

export const observe = takeEpicInWindow(
  { startActionCreator: openAttributeAnalysis, endActionCreator: closeAttributeAnalysis },
  switchMapRequestActionsToEpic([requestAttributeReport], getAttributeReport)
);
