import {
  openResultTableSummaryView,
  showHideAddColumnsDialog,
  requestSortingPreference,
  requestSortingUpdate,
  fulfillSorting,
  requestColumnsChoicePreference,
  requestColumnsChoiceUpdate,
  fulfillColumnsChoice,
  requestPageSize,
  fulfillPageSize,
  requestAnswer,
  fulfillAnswer,
  requestRecordsBasketStatus,
  fulfillRecordsBasketStatus,
  viewPageNumber,
  updateColumnsDialogExpandedNodes,
  updateColumnsDialogSelection,
} from 'wdk-client/Actions/SummaryView/ResultTableSummaryViewActions';
import { requestStep, fulfillStep } from 'wdk-client/Actions/StepActions';
import { requestUpdateBasket, fulfillUpdateBasket } from 'wdk-client/Actions/BasketActions';
import { InferAction } from 'wdk-client/Utils/ActionCreatorUtils';
import { Action } from 'wdk-client/Actions';
import { Answer, AnswerJsonFormatConfig, PrimaryKey, AttributesConfig } from 'wdk-client/Utils/WdkModel';
import { getSummaryTableConfigUserPref, setResultTableColumnsPref, setResultTableSortingPref } from 'wdk-client/Utils/UserPreferencesUtils';
import { EpicDependencies } from 'wdk-client/Core/Store';
import { Observable, combineLatest, merge, of, empty } from 'rxjs';
import { filter, map, mergeMap, takeUntil } from 'rxjs/operators';
import { combineEpics, StateObservable } from 'redux-observable';
import {mapRequestActionsToEpic, takeEpicInWindow} from 'wdk-client/Utils/ActionCreatorUtils';

export const key = 'resultTableSummaryView';

export type BasketScope = "global" | "project";

type BasketStatus = 'yes' | 'no' | 'loading';

export type State = {
    currentPage?: number;
    answer?: Answer;
    questionFullName?: string;  // remember question so can validate sorting and columns fulfill actions
    basketStatusArray?: Array<BasketStatus>; // cardinality == pageSize
    columnsDialogIsOpen: boolean;
    columnsDialogSelection?:Array<string> //
    columnsDialogExpandedNodes?:Array<string>
};

const initialState: State = {
    columnsDialogIsOpen: false
};

// return complete basket status array, setting some elements to 'loading' 
function getUpdatedBasketStatus(newStatus : BasketStatus, answer : Answer, basketStatus: Array<BasketStatus>, loadingPrimaryKeys : Set<PrimaryKey>) : Array<BasketStatus> {

    return basketStatus.map((s,i) => {
        if (loadingPrimaryKeys.has(answer.records[i].id)) return newStatus;
        return s;
    });
}

function reduceBasketUpdateAction (state: State, action: Action ) : State {
    let  status : BasketStatus;
    if (action.type == requestUpdateBasket.type) status = 'loading'
    else if (action.type == fulfillUpdateBasket.type) status = action.payload.operation === 'add'? 'yes' : 'no';
    else return state;
 
    if (state.basketStatusArray == undefined || state.answer == undefined || 
        action.payload.recordClassName != state.answer.meta.recordClassName) 
        return { ...state};
    let newBasketStatusArray = getUpdatedBasketStatus(status, state.answer, state.basketStatusArray, action.payload.primaryKeys)
    return {...state, basketStatusArray: newBasketStatusArray};
}

function reduceColumnsFulfillAction(state: State, action: Action ) : State {
    if (action.type != fulfillColumnsChoice.type
        || action.payload.questionName != state.questionFullName) return state;

    return { ...state, columnsDialogSelection: action.payload.columns};
}

export function reduce(state: State = initialState, action: Action): State {
    switch (action.type) {
        case fulfillAnswer.type: {
            return { ...state, answer: action.payload.answer };
        } case fulfillRecordsBasketStatus.type: {
            return { ...state, basketStatusArray: action.payload.basketStatus.map(status => status? 'yes' : 'no') };
        } case requestColumnsChoicePreference.type: {
            return {...state, questionFullName: action.payload.questionName}
        } case requestSortingPreference.type: {
            return {...state, questionFullName: action.payload.questionName}
        } case viewPageNumber.type: {
            return {...state, currentPage: action.payload.page}
        } case requestUpdateBasket.type : {
            return reduceBasketUpdateAction(state, action);
        } case fulfillUpdateBasket.type : {
            return reduceBasketUpdateAction(state, action);
        } case showHideAddColumnsDialog.type: {
            return { ...state, columnsDialogIsOpen: action.payload.show}
        } case updateColumnsDialogExpandedNodes.type: {
            return { ...state, columnsDialogExpandedNodes: action.payload.expanded}
        } case updateColumnsDialogSelection.type: {
            return { ...state, columnsDialogSelection: action.payload.selection}
        } case fulfillColumnsChoice.type: {
            return reduceColumnsFulfillAction(state, action);
    }


    default: {
            return state;
        }
    }
}

async function getFirstPageNumber([openResultTableSummaryViewAction]: [InferAction<typeof openResultTableSummaryView>], state$: Observable<State>, { wdkService }: EpicDependencies) : Promise<InferAction<typeof viewPageNumber>> {
    return viewPageNumber(1);
}

async function getRequestStep([openResultTableSummaryViewAction]: [InferAction<typeof openResultTableSummaryView>], state$: Observable<State>, { wdkService }: EpicDependencies) : Promise<InferAction<typeof requestStep>> {

    let stepId = openResultTableSummaryViewAction.payload.stepId;
    return requestStep(stepId);
}

async function getRequestColumnsPreference([requestAction]: [InferAction<typeof fulfillStep>], state$: Observable<State>, { }: EpicDependencies) : Promise<InferAction<typeof requestColumnsChoicePreference>> {
    return requestColumnsChoicePreference(requestAction.payload.step.answerSpec.questionName);
}

// this probably belongs in user preference land
async function getFulfillColumnsPreference([requestAction]: [InferAction<typeof requestColumnsChoicePreference>], state$: Observable<State>, { wdkService }: EpicDependencies) : Promise<InferAction<typeof fulfillColumnsChoice>> {

    let summaryTableConfigPref = await getSummaryTableConfigUserPref(requestAction.payload.questionName, wdkService);
    return fulfillColumnsChoice(summaryTableConfigPref.columns, requestAction.payload.questionName);
}

async function getFulfillColumnsUpdate([requestAction]: [InferAction<typeof requestColumnsChoiceUpdate>], state$: Observable<State>, { wdkService }: EpicDependencies) : Promise<InferAction<typeof fulfillColumnsChoice>> {

    await setResultTableColumnsPref(requestAction.payload.questionName, wdkService, requestAction.payload.columns);
    return fulfillColumnsChoice(requestAction.payload.columns, requestAction.payload.questionName);
}

// these guys probably belong in user preference land
async function getRequestSortingPreference([requestAction]: [InferAction<typeof fulfillStep>], state$: Observable<State>, { }: EpicDependencies) : Promise<InferAction<typeof requestSortingPreference>> {
    return requestSortingPreference(requestAction.payload.step.answerSpec.questionName);
}

async function getFulfillSortingPreference([requestAction]: [InferAction<typeof requestSortingPreference>], state$: Observable<State>, { wdkService }: EpicDependencies) : Promise<InferAction<typeof fulfillSorting>> {

    // TODO: if no user preference, get the default from the question!
    let summaryTableConfigPref = await getSummaryTableConfigUserPref(requestAction.payload.questionName, wdkService);
    return fulfillSorting(summaryTableConfigPref.sorting, requestAction.payload.questionName);
}

async function getFulfillSortingUpdate([requestAction]: [InferAction<typeof requestSortingUpdate>], state$: Observable<State>, { wdkService }: EpicDependencies) : Promise<InferAction<typeof fulfillSorting>> {

    await setResultTableSortingPref(requestAction.payload.questionName, wdkService, requestAction.payload.sorting);
    return fulfillSorting(requestAction.payload.sorting, requestAction.payload.questionName);
}

async function getFulfillPageSize([requestAction]: [InferAction<typeof requestPageSize>], state$: Observable<State>, { wdkService }: EpicDependencies) : Promise<InferAction<typeof fulfillPageSize>> {
    // TODO: need to provide a default if no pref available
    // might want to have an object manage this
    let userPrefs = await wdkService.getCurrentUserPreferences();
    return fulfillPageSize(+userPrefs.global.preference_global_items_per_page);
}

async function getRequestAnswer([openResultTableSummaryViewAction, fulfillStepAction, viewPageNumberAction, fulfillPageSizeAction, fulfillColumnsChoiceAction, fulfillSortingAction]: [InferAction<typeof openResultTableSummaryView>, InferAction<typeof fulfillStep>, InferAction<typeof viewPageNumber>, InferAction<typeof fulfillPageSize>, InferAction<typeof fulfillColumnsChoice>, InferAction<typeof fulfillSorting>], state$: Observable<State>, { wdkService }: EpicDependencies) : Promise<InferAction<typeof requestAnswer> | undefined> {
    if (fulfillStepAction.payload.step.answerSpec.questionName !== fulfillColumnsChoiceAction.payload.questionName
        || openResultTableSummaryViewAction.payload.stepId != fulfillStepAction.payload.step.id) return undefined;

    let numRecords = fulfillPageSizeAction.payload.pageSize;
    let offset = numRecords * (viewPageNumberAction.payload.page - 1);
    let stepId = openResultTableSummaryViewAction.payload.stepId
    let pagination = {numRecords, offset}; 
    let attributes = fulfillColumnsChoiceAction.payload.columns;
    let sorting = fulfillSortingAction.payload.sorting;
    let columnsConfig : AttributesConfig = {attributes, sorting};
    return requestAnswer(stepId, columnsConfig, pagination);
}

async function getFulfillAnswer([requestAction]: [InferAction<typeof requestAnswer>], state$: Observable<State>, { wdkService }: EpicDependencies) : Promise<InferAction<typeof fulfillAnswer>> {
    let answerJsonFormatConfig = [
        requestAction.payload.columnsConfig.sorting,
        requestAction.payload.columnsConfig.attributes,
        requestAction.payload.pagination
    ];
    let answer = await wdkService.getStepAnswerJson(requestAction.payload.stepId, <AnswerJsonFormatConfig>answerJsonFormatConfig);
    return fulfillAnswer(answer);
}

async function getRequestRecordsBasketStatus([requestAction]: [InferAction<typeof fulfillAnswer>], state$: Observable<State>, { }: EpicDependencies) : Promise<InferAction<typeof requestRecordsBasketStatus>> {
    let primaryKeys = requestAction.payload.answer.records.map((recordInstance) => recordInstance.id);
    return requestRecordsBasketStatus(requestAction.payload.answer.meta.recordClassName, primaryKeys);
}

async function getFulfillRecordsBasketStatus([requestAction]: [InferAction<typeof requestRecordsBasketStatus>], state$: Observable<State>, { wdkService }: EpicDependencies) : Promise<InferAction<typeof fulfillRecordsBasketStatus>> {
    let recordsStatus = await wdkService.getBasketStatusPk(requestAction.payload.recordClassName, requestAction.payload.basketQuery);
    return fulfillRecordsBasketStatus(recordsStatus);
}
const mrate = mapRequestActionsToEpic;

// This is very similar to the original `observe` function (above), expect for
// that it includes the outter `takeEpicInWindow` function call. This employs
// the behavior that the epic will only be active when the first action is
// emitted, and become inactive when the second action is emitted. If both
// actions are the same, as is the case here, then the resulting behavior is
// that when the action is emitted, the in-progress epic is "cancelled", and
// a new epic is started.
export const windowedObserve =
  takeEpicInWindow<State>(
    openResultTableSummaryView,
    // TODO Replace wtih closeResultTableSummaryView when applicable
    openResultTableSummaryView,
    combineEpics(
      mrate([openResultTableSummaryView], getRequestStep),
      mrate([openResultTableSummaryView], getFirstPageNumber),
      /*
      mrate([openResultTableSummaryView], getRequestPageSize),
      mrate([fulfillStep], getRequestColumnsChoicePreference),  // need question from step
      mrate([requestColumnsChoicePreference], getFulfillColumnsChoice),
      mrate([requestColumnsChoiceUpdate], getFulfillColumnsChoice),
      mrate([fulfillStep], getRequestSortingPreference),  // need question from step
      mrate([requestSortingPreference], getFulfillSorting),
      mrate([requestSortingUpdate], getFulfillSorting),
      mrate([requestPageSize], getFulfillPageSize),
      mrate(
        [
          openResultTableSummaryView,
          fulfillStep,
          viewPageNumber,
          fulfillPageSize,
          fulfillColumnsChoice,
          fulfillSorting,
        ],
       getRequestAnswer,
      ),
    */  
      mrate([requestAnswer], getFulfillAnswer),
      mrate([fulfillAnswer], getRequestRecordsBasketStatus),
      mrate([requestRecordsBasketStatus], getFulfillRecordsBasketStatus),
    ),
  );
