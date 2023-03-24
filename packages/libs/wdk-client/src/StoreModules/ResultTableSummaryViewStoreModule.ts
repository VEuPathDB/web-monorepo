// TODO Make this Store Module more generic so that it can be used with an Answer (and no Step).

import stringify from 'json-stable-stringify';
import { get, stubTrue, isEqual, difference, identity } from 'lodash';
import { combineEpics, StateObservable } from 'redux-observable';
import { Action } from '../Actions';
import {
  fulfillAddStepToBasket,
  fulfillUpdateBasket,
  requestAddStepToBasket,
  requestUpdateBasket,
} from '../Actions/BasketActions';
import {
  fulfillAnswer,
  fulfillColumnsChoice,
  fulfillPageSize,
  fulfillRecordsBasketStatus,
  fulfillSorting,
  openResultTableSummaryView,
  closeResultTableSummaryView,
  requestAnswer,
  requestColumnsChoicePreference,
  requestColumnsChoiceUpdate,
  requestPageSize,
  requestPageSizeUpdate,
  requestRecordsBasketStatus,
  requestSortingPreference,
  requestSortingUpdate,
  showHideAddColumnsDialog,
  updateColumnsDialogExpandedNodes,
  updateColumnsDialogSelection,
  updateColumnsDialogSearchString,
  updateSelectedIds,
  viewPageNumber,
  requestGlobalViewFilters,
  updateGlobalViewFilters,
  fulfillGlobalViewFilters,
  reportAnswerFulfillmentError,
  requestResultTypeDetails,
  fulfillResultTypeDetails,
} from '../Actions/SummaryView/ResultTableSummaryViewActions';
import { RootState } from '../Core/State/Types';
import { EpicDependencies } from '../Core/Store';
import {
  InferAction,
  switchMapRequestActionsToEpic as smrate,
  takeEpicInWindow,
} from '../Utils/ActionCreatorUtils';
import { makeCommonErrorMessage } from '../Utils/Errors';
import {
  getResultTableColumnsPref,
  getResultTablePageSizePref,
  getResultTableSortingPref,
  setResultTableColumnsPref,
  setResultTablePageSizePref,
  setResultTableSortingPref,
  getGlobalViewFilters,
  setGlobalViewFilters,
  filterInvalidAttributes,
} from '../Utils/UserPreferencesUtils';
import {
  Answer,
  AnswerJsonFormatConfig,
  AttributesConfig,
  PrimaryKey,
  SearchConfig,
} from '../Utils/WdkModel';
import { IndexedState, indexByActionProperty } from '../Utils/ReducerUtils';
import {
  ResultType,
  getResultTypeDetails,
  getStandardReport,
  ResultTypeDetails,
} from '../Utils/WdkResult';

export const key = 'resultTableSummaryView';

export type BasketScope = 'global' | 'project';

type BasketStatus = 'yes' | 'no' | 'loading';

// View filters that are applied to all answer requests for this summary view.
// Keys are recordClass names.
type GlobalViewFilters = Record<string, SearchConfig['viewFilters']>;

type ViewState = {
  resultType?: ResultType;
  resultTypeDetails?: ResultTypeDetails;
  answer?: Answer;
  answerLoading: boolean;
  errorMessage?: string;
  addingStepToBasket: boolean;
  searchName?: string; // remember question so can validate sorting and columns fulfill actions
  basketStatusArray?: Array<BasketStatus>; // cardinality == pageSize
  columnsDialogIsOpen: boolean;
  columnsDialogSelection?: Array<string>; //
  columnsDialogSearchString?: string;
  columnsDialogExpandedNodes?: Array<string>;
  selectedIds?: string[];
  globalViewFilters: GlobalViewFilters;
};

export type State = IndexedState<ViewState>;

const initialViewState: ViewState = {
  answerLoading: false,
  addingStepToBasket: false,
  columnsDialogIsOpen: false,
  globalViewFilters: {},
};

// return complete basket status array, setting some elements to 'loading'
function getUpdatedBasketStatus(
  newStatus: BasketStatus,
  answer: Answer,
  basketStatus: Array<BasketStatus>,
  loadingPrimaryKeys: Array<PrimaryKey>
): Array<BasketStatus> {
  const stringifiedIds = new Set(loadingPrimaryKeys.map((pk) => stringify(pk)));
  return basketStatus.map((s, i) => {
    if (stringifiedIds.has(stringify(answer.records[i].id))) return newStatus;
    return s;
  });
}

function reduceBasketUpdateAction(
  state: ViewState,
  action: InferAction<typeof requestUpdateBasket>
): ViewState {
  if (
    state.basketStatusArray == undefined ||
    state.answer == undefined ||
    action.payload.recordClassName != state.answer.meta.recordClassName
  )
    return state;

  let newBasketStatusArray = getUpdatedBasketStatus(
    'loading',
    state.answer,
    state.basketStatusArray,
    action.payload.primaryKeys
  );
  return { ...state, basketStatusArray: newBasketStatusArray };
}

function reduceColumnsFulfillAction(
  state: ViewState,
  action: Action
): ViewState {
  if (
    action.type != fulfillColumnsChoice.type ||
    action.payload.searchName != state.searchName
  )
    return state;

  return { ...state, columnsDialogSelection: action.payload.columns };
}

export const reduce = indexByActionProperty(reduceView, (action: Action) =>
  get(action, ['payload', 'viewId'])
);

function reduceView(
  state: ViewState = initialViewState,
  action: Action
): ViewState {
  switch (action.type) {
    case openResultTableSummaryView.type: {
      return { ...initialViewState, resultType: action.payload.resultType };
    }
    case fulfillResultTypeDetails.type: {
      return { ...state, resultTypeDetails: action.payload.resultTypeDetails };
    }
    case requestAnswer.type: {
      return { ...state, answerLoading: true };
    }
    case fulfillAnswer.type: {
      return { ...state, answer: action.payload.answer, answerLoading: false };
    }
    case reportAnswerFulfillmentError.type: {
      return {
        ...state,
        answerLoading: false,
        errorMessage: action.payload.message,
      };
    }
    case fulfillRecordsBasketStatus.type: {
      return {
        ...state,
        basketStatusArray: action.payload.basketStatus.map((status) =>
          status ? 'yes' : 'no'
        ),
      };
    }
    case requestColumnsChoicePreference.type: {
      return { ...state, searchName: action.payload.searchName };
    }
    case requestSortingPreference.type: {
      return { ...state, searchName: action.payload.searchName };
    }
    case requestUpdateBasket.type: {
      return reduceBasketUpdateAction(state, action);
    }
    case requestAddStepToBasket.type: {
      return state.basketStatusArray
        ? {
            ...state,
            basketStatusArray: state.basketStatusArray.map(
              (_) => 'loading' as BasketStatus
            ),
            addingStepToBasket: true,
          }
        : state;
    }
    case fulfillAddStepToBasket.type: {
      return state.basketStatusArray
        ? {
            ...state,
            basketStatusArray: state.basketStatusArray.map(
              (_) => 'yes' as BasketStatus
            ),
            addingStepToBasket: false,
          }
        : state;
    }
    case showHideAddColumnsDialog.type: {
      return { ...state, columnsDialogIsOpen: action.payload.show };
    }
    case updateColumnsDialogExpandedNodes.type: {
      return { ...state, columnsDialogExpandedNodes: action.payload.expanded };
    }
    case updateColumnsDialogSelection.type: {
      return { ...state, columnsDialogSelection: action.payload.selection };
    }
    case updateColumnsDialogSearchString.type: {
      return {
        ...state,
        columnsDialogSearchString: action.payload.searchString,
      };
    }
    case fulfillColumnsChoice.type: {
      return reduceColumnsFulfillAction(state, action);
    }
    case updateSelectedIds.type: {
      return { ...state, selectedIds: action.payload.ids };
    }

    case fulfillGlobalViewFilters.type: {
      return {
        ...state,
        globalViewFilters: {
          ...state.globalViewFilters,
          [action.payload.recordClassName]: action.payload.viewFilters,
        },
      };
    }

    default: {
      return state;
    }
  }
}

const openRTS = openResultTableSummaryView;

async function getFirstPageNumber(
  [openAction]: [InferAction<typeof openRTS>],
  state$: StateObservable<RootState>,
  { wdkService }: EpicDependencies
): Promise<InferAction<typeof viewPageNumber>> {
  return viewPageNumber(openAction.payload.viewId, 1);
}

async function getRequestResultTypeDetails(
  [openRTSAction]: [InferAction<typeof openRTS>],
  state$: StateObservable<RootState>,
  { wdkService }: EpicDependencies
): Promise<InferAction<typeof requestResultTypeDetails>> {
  let { viewId, resultType } = openRTSAction.payload;
  return requestResultTypeDetails(viewId, resultType);
}

async function getFulfillResultTypeDetails(
  [openRTSAction, requestAction]: [
    InferAction<typeof openRTS>,
    InferAction<typeof requestResultTypeDetails>
  ],
  state$: StateObservable<RootState>,
  { wdkService }: EpicDependencies
): Promise<InferAction<typeof fulfillResultTypeDetails>> {
  const { viewId, resultType } = requestAction.payload;
  const resultTypeDetails = await getResultTypeDetails(wdkService, resultType);
  return fulfillResultTypeDetails(viewId, resultTypeDetails);
}

async function getRequestColumnsChoicePreference(
  [openAction, requestAction]: [
    InferAction<typeof openRTS>,
    InferAction<typeof fulfillResultTypeDetails>
  ],
  state$: StateObservable<RootState>,
  {}: EpicDependencies
): Promise<InferAction<typeof requestColumnsChoicePreference>> {
  const { searchName } = requestAction.payload.resultTypeDetails;
  return requestColumnsChoicePreference(openAction.payload.viewId, searchName);
}

function filterResultTypeDetailsActions([openRTSAction, resultTypeAction]: [
  InferAction<typeof openRTS>,
  InferAction<typeof requestResultTypeDetails | typeof fulfillResultTypeDetails>
]) {
  return openRTSAction.payload.viewId === resultTypeAction.payload.viewId;
}

// this probably belongs in user preference land
async function getFulfillColumnsChoicePreference(
  [openAction, resultTypeDetailsAction, requestAction]: [
    InferAction<typeof openRTS>,
    InferAction<typeof fulfillResultTypeDetails>,
    InferAction<typeof requestColumnsChoicePreference>
  ],
  state$: StateObservable<RootState>,
  { wdkService }: EpicDependencies
): Promise<InferAction<typeof fulfillColumnsChoice>> {
  const { resultType } = openAction.payload;
  const columns = await getResultTableColumnsPref(
    wdkService,
    requestAction.payload.searchName,
    resultType.type === 'step' ? resultType.step : undefined
  );
  const validColumns = await filterInvalidAttributes(
    wdkService,
    requestAction.payload.searchName,
    identity,
    columns
  );
  return fulfillColumnsChoice(
    openAction.payload.viewId,
    validColumns,
    requestAction.payload.searchName
  );
}

function filterFulfillBySearchName([
  openAction,
  resultTypeDetailsAction,
  requestAction,
]: [
  InferAction<typeof openRTS>,
  InferAction<typeof fulfillResultTypeDetails>,
  (
    | InferAction<typeof requestColumnsChoicePreference>
    | InferAction<typeof requestSortingPreference>
    | InferAction<typeof requestSortingUpdate>
    | InferAction<typeof requestColumnsChoiceUpdate>
  )
]) {
  const { resultTypeDetails } = resultTypeDetailsAction.payload;
  return (
    openAction.payload.viewId === requestAction.payload.viewId &&
    resultTypeDetails.searchName === requestAction.payload.searchName
  );
}

async function getFulfillColumnsChoiceUpdate(
  [openAction, resultTypeDetailsAction, requestAction]: [
    InferAction<typeof openRTS>,
    InferAction<typeof fulfillResultTypeDetails>,
    InferAction<typeof requestColumnsChoiceUpdate>
  ],
  state$: StateObservable<RootState>,
  { wdkService }: EpicDependencies
): Promise<InferAction<typeof fulfillColumnsChoice>> {
  const { resultType } = openAction.payload;

  // Save user preference and update step.
  setResultTableColumnsPref(
    requestAction.payload.searchName,
    wdkService,
    requestAction.payload.columns
  );

  if (resultType.type === 'step') {
    // FIXME Update step with redux?
    const { step } = resultType;
    const { id, displayPreferences } = step;
    const columnSelection = requestAction.payload.columns;
    const sortColumns = displayPreferences.sortColumns
      ? displayPreferences.sortColumns
      : (
          await getResultTableSortingPref(
            requestAction.payload.searchName,
            wdkService
          )
        ).map(({ attributeName: name, direction }) => ({ name, direction }));

    wdkService.updateStepProperties(id, {
      displayPreferences: { sortColumns, columnSelection },
    });
  }

  return fulfillColumnsChoice(
    openAction.payload.viewId,
    requestAction.payload.columns,
    requestAction.payload.searchName
  );
}

async function getRequestSortingPreference(
  [openAction, requestAction]: [
    InferAction<typeof openRTS>,
    InferAction<typeof fulfillResultTypeDetails>
  ],
  state$: StateObservable<RootState>,
  {}: EpicDependencies
): Promise<InferAction<typeof requestSortingPreference>> {
  return requestSortingPreference(
    openAction.payload.viewId,
    requestAction.payload.resultTypeDetails.searchName
  );
}

function filterRequestSortingPreference([openAction, requestAction]: [
  InferAction<typeof openRTS>,
  InferAction<typeof fulfillResultTypeDetails>
]) {
  return openAction.payload.viewId === requestAction.payload.viewId;
}

async function getFulfillSortingPreference(
  [openAction, strategyAction, requestAction]: [
    InferAction<typeof openRTS>,
    InferAction<typeof fulfillResultTypeDetails>,
    InferAction<typeof requestSortingPreference>
  ],
  state$: StateObservable<RootState>,
  { wdkService }: EpicDependencies
): Promise<InferAction<typeof fulfillSorting>> {
  const { resultType } = openAction.payload;
  const stepSortColumns =
    resultType.type === 'step' &&
    resultType.step.displayPreferences.sortColumns;

  const sorting = stepSortColumns
    ? stepSortColumns.map(({ name: attributeName, direction }) => ({
        attributeName,
        direction,
      }))
    : await getResultTableSortingPref(
        requestAction.payload.searchName,
        wdkService
      );
  const validSorting = await filterInvalidAttributes(
    wdkService,
    requestAction.payload.searchName,
    (spec) => spec.attributeName,
    sorting
  );

  return fulfillSorting(
    openAction.payload.viewId,
    validSorting,
    requestAction.payload.searchName
  );
}

async function getFulfillSortingUpdate(
  [openAction, resultTypeDetailsAction, requestAction]: [
    InferAction<typeof openRTS>,
    InferAction<typeof fulfillResultTypeDetails>,
    InferAction<typeof requestSortingUpdate>
  ],
  state$: StateObservable<RootState>,
  { wdkService }: EpicDependencies
): Promise<InferAction<typeof fulfillSorting>> {
  const { resultType } = openAction.payload;

  // save user preference and update step
  setResultTableSortingPref(
    requestAction.payload.searchName,
    wdkService,
    requestAction.payload.sorting
  );

  if (resultType.type === 'step') {
    // FIXME Update step with redux?
    const { step } = resultType;
    const sortColumns = requestAction.payload.sorting.map(
      ({ attributeName: name, direction }) => ({ name, direction })
    );

    const columnSelection = await getResultTableColumnsPref(
      wdkService,
      requestAction.payload.searchName,
      step
    );

    wdkService.updateStepProperties(step.id, {
      displayPreferences: { columnSelection, sortColumns },
    });
  }

  return fulfillSorting(
    openAction.payload.viewId,
    requestAction.payload.sorting,
    requestAction.payload.searchName
  );
}

async function getRequestPageSize(
  [openResultTableSummaryViewAction]: [
    InferAction<typeof openResultTableSummaryView>
  ],
  state$: StateObservable<RootState>,
  { wdkService }: EpicDependencies
): Promise<InferAction<typeof requestPageSize>> {
  return requestPageSize(openResultTableSummaryViewAction.payload.viewId);
}

async function getFulfillPageSizeUpdate(
  [requestPageSizeUpdateAction]: [InferAction<typeof requestPageSizeUpdate>],
  state$: StateObservable<RootState>,
  { wdkService }: EpicDependencies
): Promise<InferAction<typeof fulfillPageSize>> {
  setResultTablePageSizePref(
    wdkService,
    requestPageSizeUpdateAction.payload.pageSize
  );
  return fulfillPageSize(
    requestPageSizeUpdateAction.payload.viewId,
    requestPageSizeUpdateAction.payload.pageSize
  );
}

async function getFulfillPageSize(
  [requestAction]: [InferAction<typeof requestPageSize>],
  state$: StateObservable<RootState>,
  { wdkService }: EpicDependencies
): Promise<InferAction<typeof fulfillPageSize>> {
  let pageSize = await getResultTablePageSizePref(wdkService);
  return fulfillPageSize(requestAction.payload.viewId, pageSize);
}

async function getRequestAnswer(
  [
    openAction,
    fulfillResultTypeDetailsAction,
    viewPageNumberAction,
    fulfillPageSizeAction,
    fulfillColumnsChoiceAction,
    fulfillSortingAction,
    fulfillGlobalViewFiltersAction,
  ]: [
    InferAction<typeof openRTS>,
    InferAction<typeof fulfillResultTypeDetails>,
    InferAction<typeof viewPageNumber>,
    InferAction<typeof fulfillPageSize>,
    InferAction<typeof fulfillColumnsChoice>,
    InferAction<typeof fulfillSorting>,
    InferAction<typeof fulfillGlobalViewFilters>
  ],
  state$: StateObservable<RootState>,
  { wdkService }: EpicDependencies
): Promise<InferAction<typeof requestAnswer>> {
  let numRecords = fulfillPageSizeAction.payload.pageSize;
  let offset = numRecords * (viewPageNumberAction.payload.page - 1);
  let { resultType } = openAction.payload;
  let pagination = { numRecords, offset };
  let attributes = fulfillColumnsChoiceAction.payload.columns;
  let sorting = fulfillSortingAction.payload.sorting;
  let columnsConfig: AttributesConfig = { attributes, sorting };
  let { viewFilters } = fulfillGlobalViewFiltersAction.payload;
  return requestAnswer(
    openAction.payload.viewId,
    resultType,
    columnsConfig,
    pagination,
    viewFilters
  );
}

function filterRequestAnswerActions([
  openAction,
  fulfillResultTypeDetailsAction,
  viewPageNumberAction,
  fulfillPageSizeAction,
  fulfillColumnsChoiceAction,
  fulfillSortingAction,
  fulfillGlobalViewFiltersAction,
]: [
  InferAction<typeof openRTS>,
  InferAction<typeof fulfillResultTypeDetails>,
  InferAction<typeof viewPageNumber>,
  InferAction<typeof fulfillPageSize>,
  InferAction<typeof fulfillColumnsChoice>,
  InferAction<typeof fulfillSorting>,
  InferAction<typeof fulfillGlobalViewFilters>
]) {
  const { viewId } = openAction.payload;
  const { searchName, recordClassName } =
    fulfillResultTypeDetailsAction.payload.resultTypeDetails;

  return (
    viewPageNumberAction.payload.viewId === viewId &&
    fulfillPageSizeAction.payload.viewId === viewId &&
    fulfillColumnsChoiceAction.payload.viewId === viewId &&
    fulfillSortingAction.payload.viewId === viewId &&
    fulfillGlobalViewFiltersAction.payload.viewId === viewId &&
    searchName === fulfillColumnsChoiceAction.payload.searchName &&
    searchName === fulfillColumnsChoiceAction.payload.searchName &&
    searchName === fulfillSortingAction.payload.searchName &&
    fulfillGlobalViewFiltersAction.payload.recordClassName === recordClassName
  );
}

async function getFulfillAnswer(
  [openAction, requestAction]: [
    InferAction<typeof openRTS>,
    InferAction<typeof requestAnswer>
  ],
  state$: StateObservable<RootState>,
  { wdkService }: EpicDependencies
): Promise<
  | InferAction<typeof fulfillAnswer>
  | InferAction<typeof reportAnswerFulfillmentError>
> {
  const r = requestAction.payload;
  // if only columns have changed, and the new columns are a subset of
  // current, we can avoid making a service call
  const currentViewState = state$.value[key][openAction.payload.viewId];
  const currentAnswer = currentViewState && currentViewState.answer;
  if (
    currentAnswer &&
    isEqual(r.pagination, currentAnswer.meta.pagination) &&
    isEqual(r.columnsConfig.sorting, currentAnswer.meta.sorting) &&
    !isEqual(r.columnsConfig.attributes, currentAnswer.meta.attributes) &&
    difference(r.columnsConfig.attributes, currentAnswer.meta.attributes)
      .length === 0
  ) {
    const answer: Answer = {
      ...currentAnswer,
      meta: {
        ...currentAnswer.meta,
        attributes: r.columnsConfig.attributes as Answer['meta']['attributes'],
      },
    };
    return fulfillAnswer(
      openAction.payload.viewId,
      r.resultType,
      r.columnsConfig,
      r.pagination,
      r.viewFilters,
      answer
    );
  }
  // FIXME Need to figure out how to handle client errors, given that some of these inputs are stored as user preferences. We might need to clear these prefs on errors?
  let formatConfig: AnswerJsonFormatConfig = {
    sorting: r.columnsConfig.sorting,
    attributes: r.columnsConfig.attributes,
    pagination: r.pagination,
  };

  try {
    const answer = await getStandardReport(
      wdkService,
      r.resultType,
      formatConfig,
      r.viewFilters
    );
    return fulfillAnswer(
      openAction.payload.viewId,
      r.resultType,
      r.columnsConfig,
      r.pagination,
      r.viewFilters,
      answer
    );
  } catch (error) {
    wdkService.submitErrorIfUndelayedAndNot500(error);
    const message = makeCommonErrorMessage(error);
    return reportAnswerFulfillmentError(r.viewId, message);
  }
}

function filterFulfillAnswerActions([openAction, requestAction]: [
  InferAction<typeof openRTS>,
  InferAction<typeof requestAnswer>
]) {
  return openAction.payload.viewId === requestAction.payload.viewId;
}

async function getRequestRecordsBasketStatus(
  [openAction, answerAction]:
    | [InferAction<typeof openRTS>, InferAction<typeof fulfillAnswer>]
    | [
        InferAction<typeof openRTS>,
        InferAction<typeof fulfillAnswer>,
        InferAction<typeof fulfillUpdateBasket>
      ],
  state$: StateObservable<RootState>,
  {}: EpicDependencies
): Promise<InferAction<typeof requestRecordsBasketStatus>> {
  let answer = answerAction.payload.answer;
  let primaryKeys = answerAction.payload.answer.records.map(
    (recordInstance) => recordInstance.id
  );
  return requestRecordsBasketStatus(
    openAction.payload.viewId,
    answerAction.payload.pagination.offset,
    answerAction.payload.pagination.numRecords,
    answer.meta.recordClassName,
    primaryKeys
  );
}

function filterRequestRecordsBasketStatusActions([openAction, answerAction]:
  | [InferAction<typeof openRTS>, InferAction<typeof fulfillAnswer>]
  | [
      InferAction<typeof openRTS>,
      InferAction<typeof fulfillAnswer>,
      InferAction<typeof fulfillUpdateBasket>
    ]) {
  return openAction.payload.viewId === answerAction.payload.viewId;
}

async function getFulfillRecordsBasketStatus(
  [openAction, requestAction]: [
    InferAction<typeof openRTS>,
    InferAction<typeof requestRecordsBasketStatus>
  ],
  state$: StateObservable<RootState>,
  { wdkService }: EpicDependencies
): Promise<InferAction<typeof fulfillRecordsBasketStatus>> {
  let user = await wdkService.getCurrentUser();
  let recordsStatus = user.isGuest
    ? new Array(requestAction.payload.basketQuery.length).fill(false)
    : await wdkService.getBasketStatusPk(
        requestAction.payload.recordClassName,
        requestAction.payload.basketQuery
      );
  return fulfillRecordsBasketStatus(
    openAction.payload.viewId,
    requestAction.payload.pageNumber,
    requestAction.payload.pageSize,
    recordsStatus
  );
}

function filterFulfillRecordBasketStatusActions([openAction, requestAction]: [
  InferAction<typeof openRTS>,
  InferAction<typeof requestRecordsBasketStatus>
]) {
  let rp = requestAction.payload;
  let op = openAction.payload;
  return op.viewId === rp.viewId;
}

// Global view filters

async function getRequestGlobalViewFiltersPref([
  openAction,
  resultTypeDetailsAction,
]: [
  InferAction<typeof openRTS>,
  InferAction<typeof fulfillResultTypeDetails>
]): Promise<InferAction<typeof requestGlobalViewFilters>> {
  return requestGlobalViewFilters(
    openAction.payload.viewId,
    resultTypeDetailsAction.payload.resultTypeDetails.recordClassName
  );
}

function filterRequestGlobalViewFiltersActionsPref([
  openAction,
  resultTypeDetailsAction,
]: [
  InferAction<typeof openRTS>,
  InferAction<typeof fulfillResultTypeDetails>
]) {
  return openAction.payload.viewId === resultTypeDetailsAction.payload.viewId;
}

async function getFulfillGlobalViewFiltersPref(
  [openAction, resultTypeDetailsAction, requestAction]: [
    InferAction<typeof openRTS>,
    InferAction<typeof fulfillResultTypeDetails>,
    InferAction<typeof requestGlobalViewFilters>
  ],
  state$: StateObservable<RootState>,
  { wdkService }: EpicDependencies
): Promise<InferAction<typeof fulfillGlobalViewFilters>> {
  const { recordClassName } = resultTypeDetailsAction.payload.resultTypeDetails;
  const viewFilters = await getGlobalViewFilters(wdkService, recordClassName);
  return fulfillGlobalViewFilters(
    openAction.payload.viewId,
    recordClassName,
    viewFilters
  );
}

function filterFulfillStrategyByStepRecordClass([
  openAction,
  resultTypeDetailsAction,
  requestAction,
]: [
  InferAction<typeof openRTS>,
  InferAction<typeof fulfillResultTypeDetails>,
  (
    | InferAction<typeof requestGlobalViewFilters>
    | InferAction<typeof updateGlobalViewFilters>
  )
]) {
  return (
    openAction.payload.viewId === requestAction.payload.viewId &&
    openAction.payload.viewId === resultTypeDetailsAction.payload.viewId
  );
}

async function getFulfillGlobalViewFiltersUpdate(
  [openAction, resultTypeDetailsAction, updateAction]: [
    InferAction<typeof openRTS>,
    InferAction<typeof fulfillResultTypeDetails>,
    InferAction<typeof updateGlobalViewFilters>
  ],
  state$: StateObservable<RootState>,
  { wdkService }: EpicDependencies
): Promise<InferAction<typeof fulfillGlobalViewFilters>> {
  const { recordClassName, viewFilters, viewId } = updateAction.payload;
  setGlobalViewFilters(wdkService, recordClassName, viewFilters);
  return fulfillGlobalViewFilters(viewId, recordClassName, viewFilters);
}

export const observe = takeEpicInWindow(
  {
    startActionCreator: openResultTableSummaryView,
    endActionCreator: closeResultTableSummaryView,
    compareStartAndEndActions: (
      start: InferAction<typeof openResultTableSummaryView>,
      end: InferAction<typeof closeResultTableSummaryView>
    ) => start.payload.viewId === end.payload.viewId,
  },
  combineEpics(
    // FIXME Change to getRequestSearchDetails => { searchName, recordClassName }
    smrate([openRTS], getRequestResultTypeDetails),
    smrate([openRTS], getFirstPageNumber),
    smrate([openRTS], getRequestPageSize),
    smrate([openRTS, requestResultTypeDetails], getFulfillResultTypeDetails, {
      areActionsCoherent: filterResultTypeDetailsActions,
    }),
    // strat needed for searchName
    smrate(
      [openRTS, fulfillResultTypeDetails],
      getRequestColumnsChoicePreference,
      { areActionsCoherent: filterResultTypeDetailsActions }
    ),
    // strat needed for searchName
    smrate(
      [openRTS, fulfillResultTypeDetails, requestColumnsChoicePreference],
      getFulfillColumnsChoicePreference,
      { areActionsCoherent: filterFulfillBySearchName }
    ),
    // strat needed for searchName
    smrate(
      [openRTS, fulfillResultTypeDetails, requestColumnsChoiceUpdate],
      getFulfillColumnsChoiceUpdate,
      { areActionsCoherent: filterFulfillBySearchName }
    ),
    // strat needed for searchName
    smrate([openRTS, fulfillResultTypeDetails], getRequestSortingPreference, {
      areActionsCoherent: filterRequestSortingPreference,
    }),
    // strat needed for searchName
    smrate(
      [openRTS, fulfillResultTypeDetails, requestSortingPreference],
      getFulfillSortingPreference,
      { areActionsCoherent: filterFulfillBySearchName }
    ),
    smrate(
      [openRTS, fulfillResultTypeDetails, requestSortingUpdate],
      getFulfillSortingUpdate,
      { areActionsCoherent: filterFulfillBySearchName }
    ),
    // strat needed for recordClassName
    smrate(
      [openRTS, fulfillResultTypeDetails],
      getRequestGlobalViewFiltersPref,
      { areActionsCoherent: filterRequestGlobalViewFiltersActionsPref }
    ),
    // strat needed for recordClassName
    smrate(
      [openRTS, fulfillResultTypeDetails, requestGlobalViewFilters],
      getFulfillGlobalViewFiltersPref,
      { areActionsCoherent: filterFulfillStrategyByStepRecordClass }
    ),
    // strat needed for recordClassName
    smrate(
      [openRTS, fulfillResultTypeDetails, updateGlobalViewFilters],
      getFulfillGlobalViewFiltersUpdate,
      { areActionsCoherent: filterFulfillStrategyByStepRecordClass }
    ),
    smrate([requestPageSize], getFulfillPageSize),
    smrate([requestPageSizeUpdate], getFulfillPageSizeUpdate),
    // strat needed for searchName and recordClassName, also needed to indicate update to step (params, filters, etc) (this is actually not needed. the whole thing should restart)
    smrate(
      [
        openRTS,
        fulfillResultTypeDetails,
        viewPageNumber,
        fulfillPageSize,
        fulfillColumnsChoice,
        fulfillSorting,
        fulfillGlobalViewFilters,
      ],
      getRequestAnswer,
      { areActionsCoherent: filterRequestAnswerActions }
    ),
    smrate([openRTS, requestAnswer], getFulfillAnswer, {
      areActionsCoherent: filterFulfillAnswerActions,
      areActionsNew: stubTrue,
    }),
    smrate([openRTS, fulfillAnswer], getRequestRecordsBasketStatus, {
      areActionsCoherent: filterRequestRecordsBasketStatusActions,
    }),
    smrate(
      [openRTS, fulfillAnswer, fulfillUpdateBasket],
      getRequestRecordsBasketStatus,
      { areActionsCoherent: filterRequestRecordsBasketStatusActions }
    ),
    smrate(
      [openRTS, requestRecordsBasketStatus],
      getFulfillRecordsBasketStatus,
      {
        areActionsCoherent: filterFulfillRecordBasketStatusActions,
        areActionsNew: () => true,
      }
    )
  )
);
