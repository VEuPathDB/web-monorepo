import { InferAction, makeActionCreator } from '../../Utils/ActionCreatorUtils';
import {
  Answer,
  AttributesConfig,
  AttributeSortingSpec,
  Pagination,
  PrimaryKey,
  SearchConfig,
} from '../../Utils/WdkModel';
import { ResultType, ResultTypeDetails } from '../../Utils/WdkResult';

export const openResultTableSummaryView = makeActionCreator(
  'resultTableSummaryView/open',
  (viewId: string, resultType: ResultType) => ({ resultType, viewId })
);

export const closeResultTableSummaryView = makeActionCreator(
  'resultTableSummaryView/close',
  (viewId: string) => ({ viewId })
);

export const requestResultTypeDetails = makeActionCreator(
  'resultTableSummaryView/requestResultTypeDetails',
  (viewId: string, resultType: ResultType) => ({ viewId, resultType })
);

export const fulfillResultTypeDetails = makeActionCreator(
  'resultTableSummaryView/fulfillResultTypeDetails',
  (viewId: string, resultTypeDetails: ResultTypeDetails) => ({
    viewId,
    resultTypeDetails,
  })
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
    viewId,
  })
);

export const fulfillSorting = makeActionCreator(
  'resultTableSummaryView/fulfillSorting',
  (viewId: string, sorting: AttributeSortingSpec[], searchName: string) => ({
    sorting,
    searchName,
    viewId,
  })
);

export const requestColumnsChoicePreference = makeActionCreator(
  'resultTableSummaryView/requestColumnsChoicePreference',
  (viewId: string, searchName: string) => ({ searchName, viewId })
);

export const requestColumnsChoiceUpdate = makeActionCreator(
  'resultTableSummaryView/requestColumnsChoiceUpdate',
  (viewId: string, columns: string[], searchName: string) => ({
    columns,
    searchName,
    viewId,
  })
);

export const fulfillColumnsChoice = makeActionCreator(
  'resultTableSummaryView/fulfillColumnsChoice',
  (viewId: string, columns: string[], searchName: string) => ({
    columns,
    searchName,
    viewId,
  })
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
    resultType: ResultType,
    columnsConfig: AttributesConfig,
    pagination: Pagination,
    viewFilters?: SearchConfig['viewFilters']
  ) => ({ resultType, columnsConfig, pagination, viewFilters, viewId })
);

export const fulfillAnswer = makeActionCreator(
  'resultTableSummaryView/fulfillAnswer',
  (
    viewId: string,
    resultType: ResultType,
    columnsConfig: AttributesConfig,
    pagination: Pagination,
    viewFilters: SearchConfig['viewFilters'] | undefined,
    answer: Answer
  ) => ({ resultType, columnsConfig, pagination, viewFilters, answer, viewId })
);

export const reportAnswerFulfillmentError = makeActionCreator(
  'requestTableSummaryView/reportAnswerFulfillmentError',
  (viewId: string, message: string) => ({ viewId, message })
);

export const requestRecordsBasketStatus = makeActionCreator(
  'resultTableSummaryView/requestRecordsBasketStatus',
  (
    viewId: string,
    pageNumber: number,
    pageSize: number,
    recordClassName: string,
    basketQuery: PrimaryKey[]
  ) => ({ pageNumber, pageSize, recordClassName, basketQuery, viewId })
);

export const fulfillRecordsBasketStatus = makeActionCreator(
  'resultTableSummaryView/fulfillRecordsBasketStatus',
  (
    viewId: string,
    pageNumber: number,
    pageSize: number,
    basketStatus: boolean[]
  ) => ({ pageNumber, pageSize, basketStatus, viewId })
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
  (
    viewId: string,
    recordClassName: string,
    viewFilters: SearchConfig['viewFilters']
  ) => ({
    recordClassName,
    viewFilters,
    viewId,
  })
);

export const fulfillGlobalViewFilters = makeActionCreator(
  'resultTableSummaryView/fulfillGlobalViewFilters',
  (
    viewId: string,
    recordClassName: string,
    viewFilters: SearchConfig['viewFilters']
  ) => ({
    recordClassName,
    viewFilters,
    viewId,
  })
);

export type Action = InferAction<
  | typeof openResultTableSummaryView
  | typeof closeResultTableSummaryView
  | typeof requestResultTypeDetails
  | typeof fulfillResultTypeDetails
  | typeof requestSortingPreference
  | typeof requestSortingUpdate
  | typeof fulfillSorting
  | typeof requestColumnsChoicePreference
  | typeof requestColumnsChoiceUpdate
  | typeof fulfillColumnsChoice
  | typeof requestPageSize
  | typeof fulfillPageSize
  | typeof viewPageNumber
  | typeof requestAnswer
  | typeof fulfillAnswer
  | typeof reportAnswerFulfillmentError
  | typeof requestRecordsBasketStatus
  | typeof fulfillRecordsBasketStatus
  | typeof showHideAddColumnsDialog
  | typeof updateColumnsDialogSearchString
  | typeof updateColumnsDialogSelection
  | typeof updateColumnsDialogExpandedNodes
  | typeof updateSelectedIds
  | typeof requestGlobalViewFilters
  | typeof updateGlobalViewFilters
  | typeof fulfillGlobalViewFilters
>;
