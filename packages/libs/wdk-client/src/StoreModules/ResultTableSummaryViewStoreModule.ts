import {
    openResultTableSummaryView,
    closeResultTableSummaryView,
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
import { mergeMapRequestActionsToEpic as mrate, takeEpicInWindow } from 'wdk-client/Utils/ActionCreatorUtils';

export const key = 'resultTableSummaryView';

export type BasketScope = "global" | "project";

type BasketStatus = 'yes' | 'no' | 'loading';

export type State = {
    currentPage?: number;
    answer?: Answer;
    questionFullName?: string;  // remember question so can validate sorting and columns fulfill actions
    basketStatusArray?: Array<BasketStatus>; // cardinality == pageSize
    columnsDialogIsOpen: boolean;
    columnsDialogSelection?: Array<string> //
    columnsDialogExpandedNodes?: Array<string>
};

const initialState: State = {
    columnsDialogIsOpen: false
};

// return complete basket status array, setting some elements to 'loading' 
function getUpdatedBasketStatus(newStatus: BasketStatus, answer: Answer, basketStatus: Array<BasketStatus>, loadingPrimaryKeys: Set<PrimaryKey>): Array<BasketStatus> {

    return basketStatus.map((s, i) => {
        if (loadingPrimaryKeys.has(answer.records[i].id)) return newStatus;
        return s;
    });
}

function reduceBasketUpdateAction(state: State, action: Action): State {
    let status: BasketStatus;
    if (action.type == requestUpdateBasket.type) status = 'loading'
    else if (action.type == fulfillUpdateBasket.type) status = action.payload.operation === 'add' ? 'yes' : 'no';
    else return state;

    if (state.basketStatusArray == undefined || state.answer == undefined ||
        action.payload.recordClassName != state.answer.meta.recordClassName)
        return { ...state };
    let newBasketStatusArray = getUpdatedBasketStatus(status, state.answer, state.basketStatusArray, action.payload.primaryKeys)
    return { ...state, basketStatusArray: newBasketStatusArray };
}

function reduceColumnsFulfillAction(state: State, action: Action): State {
    if (action.type != fulfillColumnsChoice.type
        || action.payload.questionName != state.questionFullName) return state;

    return { ...state, columnsDialogSelection: action.payload.columns };
}

export function reduce(state: State = initialState, action: Action): State {
    switch (action.type) {
        case fulfillAnswer.type: {
            return { ...state, answer: action.payload.answer };
        } case fulfillRecordsBasketStatus.type: {
            return { ...state, basketStatusArray: action.payload.basketStatus.map(status => status ? 'yes' : 'no') };
        } case requestColumnsChoicePreference.type: {
            return { ...state, questionFullName: action.payload.questionName }
        } case requestSortingPreference.type: {
            return { ...state, questionFullName: action.payload.questionName }
        } case viewPageNumber.type: {
            return { ...state, currentPage: action.payload.page }
        } case requestUpdateBasket.type: {
            return reduceBasketUpdateAction(state, action);
        } case fulfillUpdateBasket.type: {
            return reduceBasketUpdateAction(state, action);
        } case showHideAddColumnsDialog.type: {
            return { ...state, columnsDialogIsOpen: action.payload.show }
        } case updateColumnsDialogExpandedNodes.type: {
            return { ...state, columnsDialogExpandedNodes: action.payload.expanded }
        } case updateColumnsDialogSelection.type: {
            return { ...state, columnsDialogSelection: action.payload.selection }
        } case fulfillColumnsChoice.type: {
            return reduceColumnsFulfillAction(state, action);
        }


        default: {
            return state;
        }
    }
}

const openRTS = openResultTableSummaryView;

async function getFirstPageNumber([openAction]: [InferAction<typeof openRTS>], state$: Observable<State>, { wdkService }: EpicDependencies): Promise<InferAction<typeof viewPageNumber>> {
    return viewPageNumber(1);
}

async function getRequestStep([openRTSAction]: [InferAction<typeof openRTS>], state$: Observable<State>, { wdkService }: EpicDependencies): Promise<InferAction<typeof requestStep>> {

    let stepId = openRTSAction.payload.stepId;
    return requestStep(stepId);
}

async function getRequestColumnsChoicePreference([openAction, requestAction]: [InferAction<typeof openRTS>, InferAction<typeof fulfillStep>], state$: Observable<State>, { }: EpicDependencies): Promise<InferAction<typeof requestColumnsChoicePreference>> {
    return requestColumnsChoicePreference(requestAction.payload.step.answerSpec.questionName);
}

function filterRequestColumnsChoicePreferenceActions([openAction, requestAction]: [InferAction<typeof openRTS>, InferAction<typeof fulfillStep>]) {
    return openAction.payload.stepId === requestAction.payload.step.id;
}

// this probably belongs in user preference land
async function getFulfillColumnsChoicePreference([openAction, stepAction, requestAction]: [InferAction<typeof openRTS>, InferAction<typeof fulfillStep>, InferAction<typeof requestColumnsChoicePreference>], state$: Observable<State>, { wdkService }: EpicDependencies): Promise<InferAction<typeof fulfillColumnsChoice>> {
    let summaryTableConfigPref = await getSummaryTableConfigUserPref(requestAction.payload.questionName, wdkService);
    return fulfillColumnsChoice(summaryTableConfigPref.columns, requestAction.payload.questionName);
}

function filterFulfillColumnsChoicePreferenceActions([openAction, stepAction, requestAction]: [InferAction<typeof openRTS>, InferAction<typeof fulfillStep>, InferAction<typeof requestColumnsChoicePreference>]) {
    return (openAction.payload.stepId === stepAction.payload.step.id
        && stepAction.payload.step.answerSpec.questionName === requestAction.payload.questionName);
}

async function getFulfillColumnsChoiceUpdate(
    [openAction, stepAction, requestAction]: [InferAction<typeof openRTS>, InferAction<typeof fulfillStep>, InferAction<typeof requestColumnsChoiceUpdate>],
    state$: Observable<State>, { wdkService }: EpicDependencies)
    : Promise<InferAction<typeof fulfillColumnsChoice>> {

    await setResultTableColumnsPref(requestAction.payload.questionName, wdkService, requestAction.payload.columns);
    return fulfillColumnsChoice(requestAction.payload.columns, requestAction.payload.questionName);
}

function filterFulfillColumnColumnsChoiceUpdateActions([openAction, stepAction, requestAction]: [InferAction<typeof openRTS>, InferAction<typeof fulfillStep>, InferAction<typeof requestColumnsChoiceUpdate>]) {
    return (
        openAction.payload.stepId === stepAction.payload.step.id &&
        stepAction.payload.step.answerSpec.questionName === requestAction.payload.questionName
    );
}

async function getRequestSortingPreference([openAction, requestAction]: [InferAction<typeof openRTS>, InferAction<typeof fulfillStep>], state$: Observable<State>, { }: EpicDependencies): Promise<InferAction<typeof requestSortingPreference>> {
    return requestSortingPreference(requestAction.payload.step.answerSpec.questionName);
}

function filterRequestSortingPreferenceActions([openAction, requestAction]: [InferAction<typeof openRTS>, InferAction<typeof fulfillStep>]) {
    return openAction.payload.stepId === requestAction.payload.step.id;
}

async function getFulfillSortingPreference([openAction, stepAction, requestAction]: [InferAction<typeof openRTS>, InferAction<typeof fulfillStep>, InferAction<typeof requestSortingPreference>], state$: Observable<State>, { wdkService }: EpicDependencies): Promise<InferAction<typeof fulfillSorting>> {

    let summaryTableConfigPref = await getSummaryTableConfigUserPref(requestAction.payload.questionName, wdkService);
    return fulfillSorting(summaryTableConfigPref.sorting, requestAction.payload.questionName);
}

function filterFullfillSortingPreferenceActions([openAction, stepAction, requestAction]: [InferAction<typeof openRTS>, InferAction<typeof fulfillStep>, InferAction<typeof requestSortingPreference>]) {
    return (
        openAction.payload.stepId === stepAction.payload.step.id &&
        stepAction.payload.step.answerSpec.questionName != requestAction.payload.questionName
    );
}

async function getFulfillSortingUpdate([openAction, stepAction, requestAction]: [InferAction<typeof openRTS>, InferAction<typeof fulfillStep>, InferAction<typeof requestSortingUpdate>], state$: Observable<State>, { wdkService }: EpicDependencies): Promise<InferAction<typeof fulfillSorting>> {
    await setResultTableSortingPref(requestAction.payload.questionName, wdkService, requestAction.payload.sorting);
    return fulfillSorting(requestAction.payload.sorting, requestAction.payload.questionName);
}

function filterFulfillSortingUpdateActions([openAction, stepAction, requestAction]: [InferAction<typeof openRTS>, InferAction<typeof fulfillStep>, InferAction<typeof requestSortingUpdate>]) {
    return (
        openAction.payload.stepId === stepAction.payload.step.id &&
        stepAction.payload.step.answerSpec.questionName === requestAction.payload.questionName
    );
}

async function getRequestPageSize([openResultTableSummaryViewAction]: [InferAction<typeof openResultTableSummaryView>], state$: Observable<State>, { wdkService }: EpicDependencies): Promise<InferAction<typeof requestPageSize>> {
    return requestPageSize();
}

async function getFulfillPageSize([requestAction]: [InferAction<typeof requestPageSize>], state$: Observable<State>, { wdkService }: EpicDependencies): Promise<InferAction<typeof fulfillPageSize>> {
    // TODO: need to provide a default if no pref available
    // might want to have an object manage this
    let userPrefs = await wdkService.getCurrentUserPreferences();
    return fulfillPageSize(+userPrefs.global.preference_global_items_per_page);
}

async function getRequestAnswer([openAction, fulfillStepAction, viewPageNumberAction, fulfillPageSizeAction, fulfillColumnsChoiceAction, fulfillSortingAction]: [InferAction<typeof openRTS>, InferAction<typeof fulfillStep>, InferAction<typeof viewPageNumber>, InferAction<typeof fulfillPageSize>, InferAction<typeof fulfillColumnsChoice>, InferAction<typeof fulfillSorting>], state$: Observable<State>, { wdkService }: EpicDependencies): Promise<InferAction<typeof requestAnswer>> {
    let numRecords = fulfillPageSizeAction.payload.pageSize;
    let offset = numRecords * (viewPageNumberAction.payload.page - 1);
    let stepId = openAction.payload.stepId
    let pagination = { numRecords, offset };
    let attributes = fulfillColumnsChoiceAction.payload.columns;
    let sorting = fulfillSortingAction.payload.sorting;
    let columnsConfig: AttributesConfig = { attributes, sorting };
    return requestAnswer(stepId, columnsConfig, pagination);
}

function filterRequestAnswerActions([openAction, fulfillStepAction, viewPageNumberAction, fulfillPageSizeAction, fulfillColumnsChoiceAction, fulfillSortingAction]: [InferAction<typeof openRTS>, InferAction<typeof fulfillStep>, InferAction<typeof viewPageNumber>, InferAction<typeof fulfillPageSize>, InferAction<typeof fulfillColumnsChoice>, InferAction<typeof fulfillSorting>]) {
    return (
        fulfillStepAction.payload.step.answerSpec.questionName === fulfillColumnsChoiceAction.payload.questionName &&
        openAction.payload.stepId === fulfillStepAction.payload.step.id &&
        fulfillStepAction.payload.step.answerSpec.questionName === fulfillColumnsChoiceAction.payload.questionName &&
        fulfillStepAction.payload.step.answerSpec.questionName === fulfillSortingAction.payload.questionName
    );
}

async function getFulfillAnswer([openAction, requestAction]: [InferAction<typeof openRTS>,InferAction<typeof requestAnswer>], state$: Observable<State>, { wdkService }: EpicDependencies): Promise<InferAction<typeof fulfillAnswer>> {
    let answerJsonFormatConfig = [
        requestAction.payload.columnsConfig.sorting,
        requestAction.payload.columnsConfig.attributes,
        requestAction.payload.pagination
    ];
    let r = requestAction.payload;
    let answer = await wdkService.getStepAnswerJson(requestAction.payload.stepId, <AnswerJsonFormatConfig>answerJsonFormatConfig);
    return fulfillAnswer(r.stepId, r.columnsConfig, r.pagination, answer);
}

function filterFulfillAnswerActions([openAction, requestAction]: [InferAction<typeof openRTS>,InferAction<typeof requestAnswer>]) {
    return openAction.payload.stepId === requestAction.payload.stepId;
}

async function getRequestRecordsBasketStatus([openAction, answerAction]: [InferAction<typeof openRTS>,  InferAction<typeof fulfillAnswer>], state$: Observable<State>, { }: EpicDependencies): Promise<InferAction<typeof requestRecordsBasketStatus>> {
    let answer = answerAction.payload.answer;
    let primaryKeys = answerAction.payload.answer.records.map((recordInstance) => recordInstance.id);
    return requestRecordsBasketStatus(openAction.payload.stepId, answerAction.payload.pagination.offset, answerAction.payload.pagination.numRecords, answer.meta.recordClassName, primaryKeys);
}

function filterRequestRecordsBasketStatusActions([openAction, answerAction]: [InferAction<typeof openRTS>,  InferAction<typeof fulfillAnswer>]) {
    return openAction.payload.stepId === answerAction.payload.stepId;
}

async function getFulfillRecordsBasketStatus([openAction, answerAction, requestAction]: [InferAction<typeof openRTS>, InferAction<typeof fulfillAnswer>, InferAction<typeof requestRecordsBasketStatus>], state$: Observable<State>, { wdkService }: EpicDependencies): Promise<InferAction<typeof fulfillRecordsBasketStatus>> {
    let recordsStatus = await wdkService.getBasketStatusPk(requestAction.payload.recordClassName, requestAction.payload.basketQuery);
    return fulfillRecordsBasketStatus(openAction.payload.stepId, answerAction.payload.pagination.offset, answerAction.payload.pagination.numRecords,recordsStatus);
}

function filterFulfillRecordBasketStatusActions([openAction, answerAction, requestAction]: [InferAction<typeof openRTS>, InferAction<typeof fulfillAnswer>, InferAction<typeof requestRecordsBasketStatus>]) {
    let rp = requestAction.payload;
    let ap = answerAction.payload;
    let op = openAction.payload;
    return (
        op.stepId === rp.stepId &&
        op.stepId === ap.stepId &&
        ap.pagination.offset === rp.pageNumber &&
        ap.pagination.numRecords === rp.pageSize
    );
}

export const observe =
    takeEpicInWindow(
        openResultTableSummaryView,
        closeResultTableSummaryView,
        combineEpics(
            mrate([openRTS], getRequestStep),
            mrate([openRTS], getFirstPageNumber),
            mrate([openRTS], getRequestPageSize),
            mrate([openRTS, fulfillStep], getRequestColumnsChoicePreference, filterRequestColumnsChoicePreferenceActions),
            mrate([openRTS, fulfillStep, requestColumnsChoicePreference], getFulfillColumnsChoicePreference, filterFulfillColumnsChoicePreferenceActions),
            mrate([openRTS, fulfillStep, requestColumnsChoiceUpdate], getFulfillColumnsChoiceUpdate, filterFulfillColumnColumnsChoiceUpdateActions),
            mrate([openRTS, fulfillStep], getRequestSortingPreference, filterRequestSortingPreferenceActions),  // need question from step
            mrate([openRTS, fulfillStep, requestSortingPreference], getFulfillSortingPreference, filterFullfillSortingPreferenceActions),
            mrate([openRTS, fulfillStep, requestSortingUpdate], getFulfillSortingUpdate, filterFulfillSortingUpdateActions),
            mrate([requestPageSize], getFulfillPageSize),
            mrate(
                [
                    openRTS,
                    fulfillStep,
                    viewPageNumber,
                    fulfillPageSize,
                    fulfillColumnsChoice,
                    fulfillSorting,
                ],
                getRequestAnswer,
                filterRequestAnswerActions
            ),
            mrate([openRTS, requestAnswer], getFulfillAnswer, filterFulfillAnswerActions),
            mrate([openRTS, fulfillAnswer], getRequestRecordsBasketStatus, filterRequestRecordsBasketStatusActions),
            mrate([openRTS, fulfillAnswer, requestRecordsBasketStatus], getFulfillRecordsBasketStatus, filterFulfillRecordBasketStatusActions),
        ),
    );
