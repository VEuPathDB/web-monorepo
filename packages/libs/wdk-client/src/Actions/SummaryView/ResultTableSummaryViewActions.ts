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
  AnswerSpec
} from 'wdk-client/Utils/WdkModel';

export const openResultTableSummaryView = makeActionCreator(
  'resultTableSummaryView/open',
  (stepId: number) => ({ stepId })
);

export const closeResultTableSummaryView = makeActionCreator(
  'resultTableSummaryView/close',
  (stepId: number) => ({ stepId })
);

export const showHideAddColumnsDialog = makeActionCreator(
  'resultTableSummaryView/showHideAddColumnsPopup',
  (show: boolean) => ({ show })
);

// the selection in the columns dialog, before user has hit OK
export const updateColumnsDialogSelection = makeActionCreator(
  'resultTableSummaryView/updateTransitoryColumnsSelection',
  (selection: Array<string>) => ({ selection })
);

export const updateColumnsDialogExpandedNodes = makeActionCreator(
  'resultTableSummaryView/updateColumnsExpandedNodes',
  (expanded: Array<string>) => ({ expanded })
);

export const requestSortingPreference = makeActionCreator(
  'resultTableSummaryView/requestSortingPreference',
  (questionName: string) => ({ questionName })
);

export const requestSortingUpdate = makeActionCreator(
  'resultTableSummaryView/requestSortingUpdate',
  (sorting: AttributeSortingSpec[], questionName: string) => ({
    sorting,
    questionName
  })
);

export const fulfillSorting = makeActionCreator(
  'resultTableSummaryView/fulfillSorting',
  (sorting: AttributeSortingSpec[], questionName: string) => ({
    sorting,
    questionName
  })
);

export const requestColumnsChoicePreference = makeActionCreator(
  'resultTableSummaryView/requestColumnsChoicePreference',
  (questionName: string) => ({ questionName })
);

export const requestColumnsChoiceUpdate = makeActionCreator(
  'resultTableSummaryView/requestColumnsChoiceUpdate',
  (columns: string[], questionName: string) => ({ columns, questionName })
);

export const fulfillColumnsChoice = makeActionCreator(
  'resultTableSummaryView/fulfillColumnsChoice',
  (columns: string[], questionName: string) => ({ columns, questionName })
);

export const requestPageSize = makeActionCreator(
  'resultTableSummaryView/requestPageSize',
  () => ({})
);

export const requestPageSizeUpdate = makeActionCreator(
  'resultTableSummaryView/requestPageSizeUpdate',
  (pageSize: number) => ({ pageSize })
);

export const fulfillPageSize = makeActionCreator(
  'resultTableSummaryView/fulfillPageSize',
  (pageSize: number) => ({ pageSize })
);

export const viewPageNumber = makeActionCreator(
  'resultTableSummaryView/viewPageNumber',
  (page: number) => ({ page })
);

export const requestAnswer = makeActionCreator(
  'resultTableSummaryView/requestAnswer',
  (
    stepId: number,
    columnsConfig: AttributesConfig,
    pagination: Pagination,
    viewFilters?: AnswerSpec['viewFilters'],
  ) => ({ stepId, columnsConfig, pagination, viewFilters })
);

export const fulfillAnswer = makeActionCreator(
  'resultTableSummaryView/fulfillAnswer',
  (
    stepId: number,
    columnsConfig: AttributesConfig,
    pagination: Pagination,
    viewFilters: AnswerSpec['viewFilters'] | undefined,
    answer: Answer
  ) => ({ stepId, columnsConfig, pagination, viewFilters, answer })
);

export const requestRecordsBasketStatus = makeActionCreator(
  'resultTableSummaryView/requestRecordsBasketStatus',
  (
    stepId: number,
    pageNumber: number,
    pageSize: number,
    recordClassName: string,
    basketQuery: PrimaryKey[]
  ) => ({ stepId, pageNumber, pageSize, recordClassName, basketQuery })
);

export const fulfillRecordsBasketStatus = makeActionCreator(
  'resultTableSummaryView/fulfillRecordsBasketStatus',
  (
    stepId: number,
    pageNumber: number,
    pageSize: number,
    basketStatus: boolean[]
  ) => ({ stepId, pageNumber, pageSize, basketStatus })
);

export const updateSelectedIds = makeActionCreator(
  'resultTableSummaryView/updateSelectedIds',
  (ids: string[]) => ({ ids })
);

export const requestGlobalViewFilters = makeActionCreator(
  'resultTableSummaryView/requestGlobalViewFilters',
  (recordClassName: string) => ({ recordClassName })
);

export const updateGlobalViewFilters = makeActionCreator(
  'resultTableSummaryView/updateGlobalViewFilters',
  (recordClassName: string, viewFilters: AnswerSpec['viewFilters']) => ({
    recordClassName,
    viewFilters
  })
);

export const fulfillGlobalViewFilters = makeActionCreator(
  'resultTableSummaryView/fulfillGlobalViewFilters',
  (recordClassName: string, viewFilters: AnswerSpec['viewFilters']) => ({
    recordClassName,
    viewFilters
  })
);

export type Action =
  | InferAction<typeof openResultTableSummaryView>
  | InferAction<typeof requestSortingPreference>
  | InferAction<typeof openResultTableSummaryView>
  | InferAction<typeof closeResultTableSummaryView>
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
  | InferAction<typeof updateColumnsDialogSelection>
  | InferAction<typeof updateColumnsDialogExpandedNodes>
  | InferAction<typeof updateSelectedIds>
  | InferAction<typeof requestGlobalViewFilters>
  | InferAction<typeof updateGlobalViewFilters>
  | InferAction<typeof fulfillGlobalViewFilters>;
