// TODO Make this Store Module more generic so that it can be used with an Answer (and no Step).

import stringify from 'json-stable-stringify';
import { get, stubTrue, isEqual, difference } from 'lodash';
import { combineEpics, StateObservable } from 'redux-observable';
import { Action } from 'wdk-client/Actions';
import {
  fulfillAddStepToBasket,
  fulfillUpdateBasket,
  requestAddStepToBasket,
  requestUpdateBasket
} from 'wdk-client/Actions/BasketActions';
import { fulfillStrategy, requestStrategy } from 'wdk-client/Actions/StrategyActions';
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
} from 'wdk-client/Actions/SummaryView/ResultTableSummaryViewActions';
import { RootState } from 'wdk-client/Core/State/Types';
import { EpicDependencies } from 'wdk-client/Core/Store';
import {
  InferAction,
  mergeMapRequestActionsToEpic as mrate,
  takeEpicInWindow
} from 'wdk-client/Utils/ActionCreatorUtils';
import {
  getResultTableColumnsPref,
  getResultTablePageSizePref,
  getResultTableSortingPref,
  setResultTableColumnsPref,
  setResultTablePageSizePref,
  setResultTableSortingPref,
  getGlobalViewFilters,
  setGlobalViewFilters
} from 'wdk-client/Utils/UserPreferencesUtils';
import {
  Answer,
  AnswerJsonFormatConfig,
  AttributesConfig,
  PrimaryKey,
  SearchConfig
} from 'wdk-client/Utils/WdkModel';
import { IndexedState, indexByActionProperty } from 'wdk-client/Utils/ReducerUtils';

export const key = 'resultTableSummaryView';

export type BasketScope = 'global' | 'project';

type BasketStatus = 'yes' | 'no' | 'loading';

// View filters that are applied to all answer requests for this summary view.
// Keys are recordClass names.
type GlobalViewFilters = Record<string, SearchConfig['viewFilters']>;

type ViewState = {
  stepId?: number;
  answer?: Answer;
  answerLoading: boolean;
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
  globalViewFilters: {}
};

// return complete basket status array, setting some elements to 'loading'
function getUpdatedBasketStatus(
  newStatus: BasketStatus,
  answer: Answer,
  basketStatus: Array<BasketStatus>,
  loadingPrimaryKeys: Array<PrimaryKey>
): Array<BasketStatus> {
  const stringifiedIds = new Set(loadingPrimaryKeys.map(pk => stringify(pk)));
  return basketStatus.map((s, i) => {
    if (stringifiedIds.has(stringify(answer.records[i].id))) return newStatus;
    return s;
  });
}

function reduceBasketUpdateAction(state: ViewState, action: Action): ViewState {
  let status: BasketStatus;
  if (action.type == requestUpdateBasket.type) status = 'loading';
  else if (action.type == fulfillUpdateBasket.type)
    status = action.payload.operation === 'add' ? 'yes' : 'no';
  else return state;

  if (
    state.basketStatusArray == undefined ||
    state.answer == undefined ||
    action.payload.recordClassName != state.answer.meta.recordClassName
  )
    return { ...state };
  let newBasketStatusArray = getUpdatedBasketStatus(
    status,
    state.answer,
    state.basketStatusArray,
    action.payload.primaryKeys
  );
  return { ...state, basketStatusArray: newBasketStatusArray };
}

function reduceColumnsFulfillAction(state: ViewState, action: Action): ViewState {
  if (
    action.type != fulfillColumnsChoice.type ||
    action.payload.searchName != state.searchName
  )
    return state;

  return { ...state, columnsDialogSelection: action.payload.columns };
}

export const reduce = indexByActionProperty(
  reduceView,
  (action: Action) => get(action, [ 'payload', 'viewId'])
);

function reduceView(state: ViewState = initialViewState, action: Action): ViewState {
  switch (action.type) {
    case openResultTableSummaryView.type: {
      return { ...initialViewState, stepId: action.payload.stepId };
    }
    case requestAnswer.type: {
      return { ...state, answerLoading: true };
    }
    case fulfillAnswer.type: {
      return { ...state, answer: action.payload.answer, answerLoading: false };
    }
    case reportAnswerFulfillmentError.type: {
      return { ...state, answerLoading: false };
    }
    case fulfillRecordsBasketStatus.type: {
      return {
        ...state,
        basketStatusArray: action.payload.basketStatus.map(status =>
          status ? 'yes' : 'no'
        )
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
    case fulfillUpdateBasket.type: {
      return reduceBasketUpdateAction(state, action);
    }
    case requestAddStepToBasket.type: {
      return action.payload.stepId === state.stepId && state.basketStatusArray
        ? {
            ...state,
            basketStatusArray: state.basketStatusArray.map(
              _ => 'loading' as BasketStatus
            ),
            addingStepToBasket: true
          }
        : state;
    }
    case fulfillAddStepToBasket.type: {
      return action.payload.stepId === state.stepId && state.basketStatusArray
        ? {
            ...state,
            basketStatusArray: state.basketStatusArray.map(
              _ => 'yes' as BasketStatus
            ),
            addingStepToBasket: false
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
      return { ...state, columnsDialogSearchString: action.payload.searchString };
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
          [action.payload.recordClassName]: action.payload.viewFilters
        }
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

async function getRequestStrategy(
  [openRTSAction]: [InferAction<typeof openRTS>],
  state$: StateObservable<RootState>,
  { wdkService }: EpicDependencies
): Promise<InferAction<typeof requestStrategy>> {
  let strategyId = openRTSAction.payload.stepId;
  return requestStrategy(strategyId);
}

async function getRequestColumnsChoicePreference(
  [openAction, requestAction]: [
    InferAction<typeof openRTS>,
    InferAction<typeof fulfillStrategy>
  ],
  state$: StateObservable<RootState>,
  {  }: EpicDependencies
): Promise<InferAction<typeof requestColumnsChoicePreference>> {
  let stepId = openAction.payload.stepId;
  return requestColumnsChoicePreference(
    openAction.payload.viewId,
    requestAction.payload.strategy.steps[stepId].searchName
  );
}

// this probably belongs in user preference land
async function getFulfillColumnsChoicePreference(
  [openAction, stepAction, requestAction]: [
    InferAction<typeof openRTS>,
    InferAction<typeof fulfillStrategy>,
    InferAction<typeof requestColumnsChoicePreference>
  ],
  state$: StateObservable<RootState>,
  { wdkService }: EpicDependencies
): Promise<InferAction<typeof fulfillColumnsChoice>> {

  const columns = await getResultTableColumnsPref(
    wdkService,
    requestAction.payload.searchName,
    openAction.payload.stepId
  );

  return fulfillColumnsChoice(
    openAction.payload.viewId,
    columns,
    requestAction.payload.searchName
  );
}

function filterFulfillBySearchName([
  openAction,
  strategyAction,
  requestAction
]: [
  InferAction<typeof openRTS>,
  InferAction<typeof fulfillStrategy>,
  InferAction<typeof requestColumnsChoicePreference>  |
  InferAction<typeof requestSortingPreference>  | 
  InferAction<typeof requestSortingUpdate>  |  InferAction<typeof requestColumnsChoiceUpdate> 
]) {
  let step = strategyAction.payload.strategy.steps[openAction.payload.stepId];
  return (
    openAction.payload.viewId === requestAction.payload.viewId &&
    step && 
    step.searchName === requestAction.payload.searchName
  );
}

async function getFulfillColumnsChoiceUpdate(
  [openAction, strategyAction, requestAction]: [
    InferAction<typeof openRTS>,
    InferAction<typeof fulfillStrategy>,
    InferAction<typeof requestColumnsChoiceUpdate>
  ],
  state$: StateObservable<RootState>,
  { wdkService }: EpicDependencies
): Promise<InferAction<typeof fulfillColumnsChoice>> {
  const step = strategyAction.payload.strategy.steps[openAction.payload.stepId];
  const { id, displayPrefs } = step;
  const columnSelection = requestAction.payload.columns;
  const sortColumns = displayPrefs.sortColumns
    ? displayPrefs.sortColumns
    : (await getResultTableSortingPref(
        requestAction.payload.searchName,
        wdkService
      )).map(({ attributeName: name, direction }) => ({ name, direction }));
  // Save user preference and update step.
  // FIXME Update step with redux
  setResultTableColumnsPref(
    requestAction.payload.searchName,
    wdkService,
    requestAction.payload.columns
  );
  wdkService.updateStepProperties(id, { displayPrefs: { sortColumns, columnSelection } });
  return fulfillColumnsChoice(
    openAction.payload.viewId,
    requestAction.payload.columns,
    requestAction.payload.searchName
  );
}

async function getRequestSortingPreference(
  [openAction, requestAction]: [
    InferAction<typeof openRTS>,
    InferAction<typeof fulfillStrategy>
  ],
  state$: StateObservable<RootState>,
  {  }: EpicDependencies
): Promise<InferAction<typeof requestSortingPreference>> {
  return requestSortingPreference(
    openAction.payload.viewId,
    requestAction.payload.strategy.steps[openAction.payload.stepId].searchName
  );
}

function filterRequestFilterByStepId([openAction, requestAction]: [
  InferAction<typeof openRTS>,
  InferAction<typeof fulfillStrategy>
]) {
  return  requestAction.payload.strategy.steps[openAction.payload.stepId] != undefined;
}

async function getFulfillSortingPreference(
  [openAction, strategyAction, requestAction]: [
    InferAction<typeof openRTS>,
    InferAction<typeof fulfillStrategy>,
    InferAction<typeof requestSortingPreference>
  ],
  state$: StateObservable<RootState>,
  { wdkService }: EpicDependencies
): Promise<InferAction<typeof fulfillSorting>> {
  const step = strategyAction.payload.strategy.steps[openAction.payload.stepId];
  const sorting = step.displayPrefs.sortColumns
    ? step.displayPrefs.sortColumns.map(
        ({ name: attributeName, direction }) => ({ attributeName, direction })
      )
    : await getResultTableSortingPref(
        requestAction.payload.searchName,
        wdkService
      );
  return fulfillSorting(
    openAction.payload.viewId,
    sorting,
    requestAction.payload.searchName
  );
}


async function getFulfillSortingUpdate(
  [openAction, strategyAction, requestAction]: [
    InferAction<typeof openRTS>,
    InferAction<typeof fulfillStrategy>,
    InferAction<typeof requestSortingUpdate>
  ],
  state$: StateObservable<RootState>,
  { wdkService }: EpicDependencies
): Promise<InferAction<typeof fulfillSorting>> {
  const id = openAction.payload.stepId;
  const sortColumns = requestAction.payload.sorting.map(
    ({ attributeName: name, direction }) => ({ name, direction })
  );

  const columnSelection = await getResultTableColumnsPref(
    wdkService,
    requestAction.payload.searchName,
    openAction.payload.stepId
  );

  // save user preference and update step
  // FIXME Update step with redux
  setResultTableSortingPref(
    requestAction.payload.searchName,
    wdkService,
    requestAction.payload.sorting
  );
  wdkService.updateStepProperties(id, { displayPrefs: { columnSelection, sortColumns } });
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
    fulfillStrategyAction,
    viewPageNumberAction,
    fulfillPageSizeAction,
    fulfillColumnsChoiceAction,
    fulfillSortingAction,
    fulfillGlobalViewFiltersAction
  ]: [
    InferAction<typeof openRTS>,
    InferAction<typeof fulfillStrategy>,
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
  let stepId = openAction.payload.stepId;
  let pagination = { numRecords, offset };
  let attributes = fulfillColumnsChoiceAction.payload.columns;
  let sorting = fulfillSortingAction.payload.sorting;
  let columnsConfig: AttributesConfig = { attributes, sorting };
  let { viewFilters } = fulfillGlobalViewFiltersAction.payload;
  return requestAnswer(openAction.payload.viewId, stepId, columnsConfig, pagination, viewFilters);
}

function filterRequestAnswerActions([
  openAction,
  fulfillStrategyAction,
  viewPageNumberAction,
  fulfillPageSizeAction,
  fulfillColumnsChoiceAction,
  fulfillSortingAction,
  fulfillGlobalViewFiltersAction
]: [
  InferAction<typeof openRTS>,
  InferAction<typeof fulfillStrategy>,
  InferAction<typeof viewPageNumber>,
  InferAction<typeof fulfillPageSize>,
  InferAction<typeof fulfillColumnsChoice>,
  InferAction<typeof fulfillSorting>,
  InferAction<typeof fulfillGlobalViewFilters>
]) {
  const { stepId, viewId } = openAction.payload;
  const step = fulfillStrategyAction.payload.strategy.steps[stepId];

  return (
    fulfillStrategyAction.payload.strategy.steps[stepId] != undefined &&
    viewPageNumberAction.payload.viewId === viewId &&
    fulfillPageSizeAction.payload.viewId === viewId &&
    fulfillColumnsChoiceAction.payload.viewId === viewId &&
    fulfillSortingAction.payload.viewId === viewId &&
    fulfillGlobalViewFiltersAction.payload.viewId === viewId &&
    step.searchName === fulfillColumnsChoiceAction.payload.searchName &&
    step.searchName === fulfillColumnsChoiceAction.payload.searchName &&
    step.searchName === fulfillSortingAction.payload.searchName &&
    fulfillGlobalViewFiltersAction.payload.recordClassName === step.recordClassName
  );
}

async function getFulfillAnswer(
  [openAction, requestAction]: [
    InferAction<typeof openRTS>,
    InferAction<typeof requestAnswer>
  ],
  state$: StateObservable<RootState>,
  { wdkService }: EpicDependencies
): Promise<InferAction<typeof fulfillAnswer> | InferAction<typeof reportAnswerFulfillmentError>> {
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
      difference(r.columnsConfig.attributes, currentAnswer.meta.attributes).length === 0
  ) {
      const answer: Answer = {
          ...currentAnswer,
          meta: {
              ...currentAnswer.meta,
              attributes: r.columnsConfig.attributes as Answer['meta']['attributes']
          }
      };
      return fulfillAnswer(openAction.payload.viewId, r.stepId, r.columnsConfig, r.pagination, r.viewFilters, answer);
  }
  // FIXME Need to figure out how to handle client errors, given that some of these inputs are stored as user preferences. We might need to clear these prefs on errors?
  let formatConfig: AnswerJsonFormatConfig= {
    sorting: r.columnsConfig.sorting,
    attributes: r.columnsConfig.attributes,
    pagination: r.pagination
  };

  try {
    let answer = await wdkService.getStepStandardReport(r.stepId, formatConfig, r.viewFilters);
    return fulfillAnswer(openAction.payload.viewId, r.stepId, r.columnsConfig, r.pagination, r.viewFilters, answer);
  } catch (e) {
    return reportAnswerFulfillmentError(openAction.payload.viewId);
  }
}

function filterFulfillAnswerActions([openAction, requestAction]: [
  InferAction<typeof openRTS>,
  InferAction<typeof requestAnswer>
]) {
  return (
    openAction.payload.viewId === requestAction.payload.viewId &&
    openAction.payload.stepId === requestAction.payload.stepId
  );
}

async function getRequestRecordsBasketStatus(
  [openAction, answerAction]: [
    InferAction<typeof openRTS>,
    InferAction<typeof fulfillAnswer>
  ],
  state$: StateObservable<RootState>,
  {  }: EpicDependencies
): Promise<InferAction<typeof requestRecordsBasketStatus>> {
  let answer = answerAction.payload.answer;
  let primaryKeys = answerAction.payload.answer.records.map(
    recordInstance => recordInstance.id
  );
  return requestRecordsBasketStatus(
    openAction.payload.viewId,
    openAction.payload.stepId,
    answerAction.payload.pagination.offset,
    answerAction.payload.pagination.numRecords,
    answer.meta.recordClassName,
    primaryKeys
  );
}

function filterRequestRecordsBasketStatusActions([openAction, answerAction]: [
  InferAction<typeof openRTS>,
  InferAction<typeof fulfillAnswer>
]) {
  return (
    openAction.payload.viewId === answerAction.payload.viewId &&
    openAction.payload.stepId === answerAction.payload.stepId
  );
}

async function getFulfillRecordsBasketStatus(
  [openAction, answerAction, requestAction]: [
    InferAction<typeof openRTS>,
    InferAction<typeof fulfillAnswer>,
    InferAction<typeof requestRecordsBasketStatus>
  ],
  state$: StateObservable<RootState>,
  { wdkService }: EpicDependencies
): Promise<InferAction<typeof fulfillRecordsBasketStatus>> {
  let user = await wdkService.getCurrentUser();
  let recordsStatus = user.isGuest
    ? new Array(answerAction.payload.pagination.numRecords).fill(false)
    : await wdkService.getBasketStatusPk(
        requestAction.payload.recordClassName,
        requestAction.payload.basketQuery
      );
  return fulfillRecordsBasketStatus(
    openAction.payload.viewId,
    openAction.payload.stepId,
    answerAction.payload.pagination.offset,
    answerAction.payload.pagination.numRecords,
    recordsStatus
  );
}

function filterFulfillRecordBasketStatusActions([
  openAction,
  answerAction,
  requestAction
]: [
  InferAction<typeof openRTS>,
  InferAction<typeof fulfillAnswer>,
  InferAction<typeof requestRecordsBasketStatus>
]) {
  let rp = requestAction.payload;
  let ap = answerAction.payload;
  let op = openAction.payload;
  return (
    op.viewId === rp.viewId &&
    op.viewId === ap.viewId &&
    op.stepId === rp.stepId &&
    op.stepId === ap.stepId &&
    ap.pagination.offset === rp.pageNumber &&
    ap.pagination.numRecords === rp.pageSize
  );
}

// Global view filters

async function getRequestGlobalViewFiltersPref(
  [
    openAction,
    strategyAction,
  ]: [
    InferAction<typeof openRTS>,
    InferAction<typeof fulfillStrategy>
  ],
): Promise<InferAction<typeof requestGlobalViewFilters>> {
  const step = strategyAction.payload.strategy.steps[openAction.payload.stepId];
  return requestGlobalViewFilters(
    openAction.payload.viewId,
    step.recordClassName
  );
}

function filterRequestGlobalViewFiltersActionsPref(
  [
    openAction,
    strategyAction,
  ]: [
    InferAction<typeof openRTS>,
    InferAction<typeof fulfillStrategy>
  ]
) {
  return strategyAction.payload.strategy.steps[openAction.payload.stepId] != undefined;
}

async function getFulfillGlobalViewFiltersPref(
  [
    openAction,
    strategyAction,
    requestAction
  ]: [
    InferAction<typeof openRTS>,
    InferAction<typeof fulfillStrategy>,
    InferAction<typeof requestGlobalViewFilters>
  ],
  state$: StateObservable<RootState>,
  { wdkService }: EpicDependencies
): Promise<InferAction<typeof fulfillGlobalViewFilters>> {
  const { recordClassName } = strategyAction.payload.strategy.steps[openAction.payload.stepId];
  const viewFilters = await getGlobalViewFilters(wdkService, recordClassName);
  return fulfillGlobalViewFilters(
    openAction.payload.viewId,
    recordClassName, viewFilters
  );
}

function filterFulfillStrategyByStepRecordClass(
  [
    openAction,
    strategyAction,
    requestAction
  ]: [
    InferAction<typeof openRTS>,
    InferAction<typeof fulfillStrategy>,
    InferAction<typeof requestGlobalViewFilters> | InferAction<typeof updateGlobalViewFilters>
  ]
) {
  const { stepId } = openAction.payload;
  const step = strategyAction.payload.strategy.steps[stepId];
  return (
    openAction.payload.viewId === requestAction.payload.viewId &&
    step != undefined &&
    step.recordClassName === requestAction.payload.recordClassName
  )
}

async function getFulfillGlobalViewFiltersUpdate(
  [
    openAction,
    strategyAction,
    updateAction
  ]: [
    InferAction<typeof openRTS>,
    InferAction<typeof fulfillStrategy>,
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
    ) => start.payload.viewId === end.payload.viewId
  },
  combineEpics(
    mrate([openRTS], getRequestStrategy),
    mrate([openRTS], getFirstPageNumber),
    mrate([openRTS], getRequestPageSize),
    mrate([openRTS, fulfillStrategy], getRequestColumnsChoicePreference,
      { areActionsCoherent: filterRequestFilterByStepId }),
    mrate([openRTS, fulfillStrategy, requestColumnsChoicePreference], getFulfillColumnsChoicePreference,
      { areActionsCoherent: filterFulfillBySearchName }),
    mrate([openRTS, fulfillStrategy, requestColumnsChoiceUpdate], getFulfillColumnsChoiceUpdate,
      { areActionsCoherent: filterFulfillBySearchName }),
    mrate([openRTS, fulfillStrategy], getRequestSortingPreference,
      { areActionsCoherent: filterRequestFilterByStepId }),
    // need question from step
    mrate([openRTS, fulfillStrategy, requestSortingPreference], getFulfillSortingPreference,
      { areActionsCoherent: filterFulfillBySearchName }),
    mrate([openRTS, fulfillStrategy, requestSortingUpdate], getFulfillSortingUpdate,
      { areActionsCoherent: filterFulfillBySearchName }),
    mrate([openRTS, fulfillStrategy], getRequestGlobalViewFiltersPref,
      { areActionsCoherent: filterRequestGlobalViewFiltersActionsPref }),
    mrate([openRTS, fulfillStrategy, requestGlobalViewFilters], getFulfillGlobalViewFiltersPref,
      { areActionsCoherent: filterFulfillStrategyByStepRecordClass }),
    mrate([openRTS, fulfillStrategy, updateGlobalViewFilters], getFulfillGlobalViewFiltersUpdate,
      { areActionsCoherent: filterFulfillStrategyByStepRecordClass }),
    mrate([requestPageSize], getFulfillPageSize),
    mrate([requestPageSizeUpdate], getFulfillPageSizeUpdate),
    mrate([openRTS, fulfillStrategy, viewPageNumber, fulfillPageSize, fulfillColumnsChoice, fulfillSorting, fulfillGlobalViewFilters], getRequestAnswer,
      { areActionsCoherent: filterRequestAnswerActions }),
    mrate([openRTS, requestAnswer], getFulfillAnswer,
      { areActionsCoherent: filterFulfillAnswerActions, areActionsNew: stubTrue }),
    mrate([openRTS, fulfillAnswer], getRequestRecordsBasketStatus,
      { areActionsCoherent: filterRequestRecordsBasketStatusActions }),
    mrate([openRTS, fulfillAnswer, requestRecordsBasketStatus], getFulfillRecordsBasketStatus,
      { areActionsCoherent: filterFulfillRecordBasketStatusActions })
  )
);
