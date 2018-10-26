import { matchAction, Reducer, combineReducers } from 'wdk-client/Utils/ReducerUtils';
import { ServiceError } from 'wdk-client/Utils/WdkService';

import {
  AttributeReportCancelled,
  AttributeReportFailed,
  AttributeReportReceived,
  AttributeReportRequested,
  TablePaged,
  TableSorted,
  TableSearched,
  TabSelected,
  TableRowsPerPageChanged
} from 'wdk-client/Views/AttributeAnalysis/BaseAttributeAnalysis/BaseAttributeAnalysisActions';


// Report state
// ------------

type InitialState = { status: 'idle' };
type FetchingState = { status: 'fetching' };
type ErrorState = { status: 'error', error: ServiceError };
type SuccessState = { status: 'success', report: any };

type ReportState = InitialState | FetchingState | ErrorState | SuccessState;

const reduceReport = <Reducer<ReportState>>matchAction({ status: 'idle' },
  [AttributeReportRequested, () => ({ status: 'fetching' })],
  [AttributeReportReceived, (state, { report }) => ({ status: 'success', report })],
  [AttributeReportFailed, (state, { error }) => ({ status: 'error', error })],
  [AttributeReportCancelled, () => ({ status: 'idle' })]
)


// Table state
// -----------

type TableState<T extends string> = {
  sort: { key: T; direction: 'asc' | 'desc'; }
  search: string;
  currentPage: number;
  rowsPerPage: number;
}

const makeReduceTable = <T extends string>(init: TableState<T>) => <Reducer<TableState<T>>>matchAction(init,
  [AttributeReportCancelled, (state): TableState<T> => init],
  [TablePaged, (state, currentPage): TableState<T> => ({
    ...state,
    currentPage
  })],
  [TableRowsPerPageChanged, (state, rowsPerPage): TableState<T> => ({
    ...state,
    currentPage: 1,
    rowsPerPage
  })],
  [TableSorted, (state, sort): TableState<T> => ({
    ...state,
    currentPage: 1,
    sort
    // casting return value since the payload of TableSorted cannot be genericized.
  }) as TableState<T>],
  [TableSearched, (state, search): TableState<T> => ({
    ...state,
    currentPage: 1,
    search
  })],
)


// Tabs state
// ----------

type TabsState = {
  activeTab: 'table' | 'visualization';

}

const reduceTabs = <Reducer<TabsState>>matchAction({ activeTab: 'visualization' },
  [AttributeReportCancelled, (state) => ({ activeTab: 'visualization' })],
  [TabSelected, (state, activeTab) => ({ ...state, activeTab })]
)


// Composite state
// ---------------

export type State<T extends string, S = {}> = {
  data: ReportState;
  table: TableState<T>;
  tabs: TabsState;
  visualization: S;
}

export const makeReduce = <T extends string, S>(initTableSortColumn: T, reduceVisualization: Reducer<S> = () => ({} as S)): Reducer<State<T, S>> => combineReducers({
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
})
