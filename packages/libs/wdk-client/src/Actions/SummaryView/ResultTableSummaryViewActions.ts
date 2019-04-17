import {
  InferAction,
  makeActionCreator
} from 'wdk-client/Utils/ActionCreatorUtils';
import {
  Answer,
  AttributesConfig,
  AttributeSortingSpec,
  Pagination,
  PrimaryKey,
  SearchConfig
} from 'wdk-client/Utils/WdkModel';

export const openResultTableSummaryView = makeActionCreator(
  'resultTableSummaryView/open',
  (viewId: string, stepId: number) => ({ stepId, viewId })
);

export const closeResultTableSummaryView = makeActionCreator(
  'resultTableSummaryView/close',
  (viewId: string, stepId: number) => ({ stepId, viewId })
);

export const showHideAddColumnsDialog = makeActionCreator(
  'resultTableSummaryView/showHideAddColumnsPopup',
  (viewId: string, show: boolean) => ({ show, viewId })
);

// the selection in the columns dialog, before user has hit OK
export const updateColumnsDialogSelection = makeActionCreator(
  'resultTableSummaryView/updateTransitoryColumnsSelection',
  (viewId: string, selection: Array<string>) => ({ selection, viewId })
);

export const updateColumnsDialogSearchString = makeActionCreator(
  'resultTableSummaryView/updateColumnsDialogSearchString',
  (viewId: string, searchString: string) => ({ viewId, searchString })
);

export const updateColumnsDialogExpandedNodes = makeActionCreator(
  'resultTableSummaryView/updateColumnsExpandedNodes',
  (viewId: string, expanded: Array<string>) => ({ expanded, viewId })
);

export const requestSortingPreference = makeActionCreator(
  'resultTableSummaryView/requestSortingPreference',
  (viewId: string, searchName: string) => ({ searchName, viewId })
);

export const requestSortingUpdate = makeActionCreator(
  'resultTableSummaryView/requestSortingUpdate',
  (viewId: string, sorting: AttributeSortingSpec[], searchName: string) => ({
    sorting,
    searchName,
    viewId
  })
);

export const fulfillSorting = makeActionCreator(
  'resultTableSummaryView/fulfillSorting',
  (viewId: string, sorting: AttributeSortingSpec[], searchName: string) => ({
    sorting,
    searchName,
    viewId
  })
);

export const requestColumnsChoicePreference = makeActionCreator(
  'resultTableSummaryView/requestColumnsChoicePreference',
  (viewId: string, searchName: string) => ({ searchName, viewId })
);

export const requestColumnsChoiceUpdate = makeActionCreator(
  'resultTableSummaryView/requestColumnsChoiceUpdate',
  (viewId: string, columns: string[], searchName: string) => ({ columns, searchName, viewId })
);

export const fulfillColumnsChoice = makeActionCreator(
  'resultTableSummaryView/fulfillColumnsChoice',
  (viewId: string, columns: string[], searchName: string) => ({ columns, searchName, viewId })
);

export const requestPageSize = makeActionCreator(
  'resultTableSummaryView/requestPageSize',
  (viewId: string) => ({ viewId })
);

export const requestPageSizeUpdate = makeActionCreator(
  'resultTableSummaryView/requestPageSizeUpdate',
  (viewId: string, pageSize: number) => ({ pageSize, viewId })
);

export const fulfillPageSize = makeActionCreator(
  'resultTableSummaryView/fulfillPageSize',
  (viewId: string, pageSize: number) => ({ pageSize, viewId })
);

export const viewPageNumber = makeActionCreator(
  'resultTableSummaryView/viewPageNumber',
  (viewId: string, page: number) => ({ page, viewId })
);

export const requestAnswer = makeActionCreator(
  'resultTableSummaryView/requestAnswer',
  (
    viewId: string,
    stepId: number,
    columnsConfig: AttributesConfig,
    pagination: Pagination,
    viewFilters?: SearchConfig['viewFilters'],
  ) => ({ stepId, columnsConfig, pagination, viewFilters, viewId })
);

export const fulfillAnswer = makeActionCreator(
  'resultTableSummaryView/fulfillAnswer',
  (
    viewId: string,
    stepId: number,
    columnsConfig: AttributesConfig,
    pagination: Pagination,
    viewFilters: SearchConfig['viewFilters'] | undefined,
    answer: Answer
  ) => ({ stepId, columnsConfig, pagination, viewFilters, answer, viewId })
);

export const requestRecordsBasketStatus = makeActionCreator(
  'resultTableSummaryView/requestRecordsBasketStatus',
  (
    viewId: string,
    stepId: number,
    pageNumber: number,
    pageSize: number,
    recordClassName: string,
    basketQuery: PrimaryKey[]
  ) => ({ stepId, pageNumber, pageSize, recordClassName, basketQuery, viewId })
);

export const fulfillRecordsBasketStatus = makeActionCreator(
  'resultTableSummaryView/fulfillRecordsBasketStatus',
  (
    viewId: string,
    stepId: number,
    pageNumber: number,
    pageSize: number,
    basketStatus: boolean[]
  ) => ({ stepId, pageNumber, pageSize, basketStatus, viewId })
);

export const updateSelectedIds = makeActionCreator(
  'resultTableSummaryView/updateSelectedIds',
  (viewId: string, ids: string[]) => ({ ids, viewId })
);

export const requestGlobalViewFilters = makeActionCreator(
  'resultTableSummaryView/requestGlobalViewFilters',
  (viewId: string, recordClassName: string) => ({ recordClassName, viewId })
);

export const updateGlobalViewFilters = makeActionCreator(
  'resultTableSummaryView/updateGlobalViewFilters',
  (viewId: string, recordClassName: string, viewFilters: SearchConfig['viewFilters']) => ({
    recordClassName,
    viewFilters,
    viewId
  })
);

export const fulfillGlobalViewFilters = makeActionCreator(
  'resultTableSummaryView/fulfillGlobalViewFilters',
  (viewId: string, recordClassName: string, viewFilters: SearchConfig['viewFilters']) => ({
    recordClassName,
    viewFilters,
    viewId
  })
);

export type Action =
  | InferAction<typeof openResultTableSummaryView>
  | InferAction<typeof closeResultTableSummaryView>
  | InferAction<typeof requestSortingPreference>
  | InferAction<typeof openResultTableSummaryView>
  | InferAction<typeof requestSortingUpdate>
  | InferAction<typeof fulfillSorting>
  | InferAction<typeof requestColumnsChoicePreference>
  | InferAction<typeof requestColumnsChoiceUpdate>
  | InferAction<typeof fulfillColumnsChoice>
  | InferAction<typeof requestPageSize>
  | InferAction<typeof fulfillPageSize>
  | InferAction<typeof viewPageNumber>
  | InferAction<typeof requestAnswer>
  | InferAction<typeof fulfillAnswer>
  | InferAction<typeof requestRecordsBasketStatus>
  | InferAction<typeof fulfillRecordsBasketStatus>
  | InferAction<typeof showHideAddColumnsDialog>
  | InferAction<typeof updateColumnsDialogSearchString>
  | InferAction<typeof updateColumnsDialogSelection>
  | InferAction<typeof updateColumnsDialogExpandedNodes>
  | InferAction<typeof updateSelectedIds>
  | InferAction<typeof requestGlobalViewFilters>
  | InferAction<typeof updateGlobalViewFilters>
  | InferAction<typeof fulfillGlobalViewFilters>;
