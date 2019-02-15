import stringify from 'json-stable-stringify';
import { difference, isEqual } from 'lodash';
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
    requestPageSizeUpdate,
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
import { requestUpdateBasket, fulfillUpdateBasket, requestAddStepToBasket, fulfillAddStepToBasket } from 'wdk-client/Actions/BasketActions';
import { InferAction } from 'wdk-client/Utils/ActionCreatorUtils';
import { Action } from 'wdk-client/Actions';
import { Answer, AnswerJsonFormatConfig, PrimaryKey, AttributesConfig } from 'wdk-client/Utils/WdkModel';
import { getResultTableColumnsPref, getResultTableSortingPref, setResultTableColumnsPref, setResultTableSortingPref, setResultTablePageSizePref, getPageSizeFromPreferences } from 'wdk-client/Utils/UserPreferencesUtils';
import { EpicDependencies } from 'wdk-client/Core/Store';
import { combineEpics, StateObservable } from 'redux-observable';
import { mergeMapRequestActionsToEpic as mrate, takeEpicInWindow } from 'wdk-client/Utils/ActionCreatorUtils';
import { RootState } from 'wdk-client/Core/State/Types';

export const key = 'resultTableSummaryView';

export type BasketScope = "global" | "project";

type BasketStatus = 'yes' | 'no' | 'loading';

export type State = {
    stepId?: number;
    answer?: Answer;
    answerLoading: boolean;
    addingStepToBasket: boolean;
    questionFullName?: string;  // remember question so can validate sorting and columns fulfill actions
    basketStatusArray?: Array<BasketStatus>; // cardinality == pageSize
    columnsDialogIsOpen: boolean;
    columnsDialogSelection?: Array<string> //
    columnsDialogExpandedNodes?: Array<string>
};

const initialState: State = {
    answerLoading: false,
    addingStepToBasket: false,
    columnsDialogIsOpen: false
};

// return complete basket status array, setting some elements to 'loading' 
function getUpdatedBasketStatus(newStatus: BasketStatus, answer: Answer, basketStatus: Array<BasketStatus>, loadingPrimaryKeys: Array<PrimaryKey>): Array<BasketStatus> {
    const stringifiedIds = new Set(loadingPrimaryKeys.map(pk => stringify(pk)));
    return basketStatus.map((s, i) => {
        if (stringifiedIds.has(stringify(answer.records[i].id))) return newStatus;
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
        case openResultTableSummaryView.type: {
            return { ...state, stepId: action.payload.stepId };
        } case requestAnswer.type: {
            return { ...state, answerLoading: true };
        } case fulfillAnswer.type: {
            return { ...state, answer: action.payload.answer, answerLoading: false };
        } case fulfillRecordsBasketStatus.type: {
            return { ...state, basketStatusArray: action.payload.basketStatus.map(status => status ? 'yes' : 'no') };
        } case requestColumnsChoicePreference.type: {
            return { ...state, questionFullName: action.payload.questionName }
        } case requestSortingPreference.type: {
            return { ...state, questionFullName: action.payload.questionName }
        } case requestUpdateBasket.type: {
            return reduceBasketUpdateAction(state, action);
        } case fulfillUpdateBasket.type: {
            return reduceBasketUpdateAction(state, action);
        } case requestAddStepToBasket.type: {
            return action.payload.stepId === state.stepId && state.basketStatusArray
                ? { ...state, basketStatusArray: state.basketStatusArray.map(_ => 'loading' as BasketStatus ), addingStepToBasket: true }
                : state;
        } case fulfillAddStepToBasket.type: {
            return action.payload.stepId === state.stepId && state.basketStatusArray
                ? { ...state, basketStatusArray: state.basketStatusArray.map(_ => 'yes' as BasketStatus ), addingStepToBasket: false }
                : state;
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

async function getFirstPageNumber([openAction]: [InferAction<typeof openRTS>], state$: StateObservable<RootState>, { wdkService }: EpicDependencies): Promise<InferAction<typeof viewPageNumber>> {
    return viewPageNumber(1);
}

async function getRequestStep([openRTSAction]: [InferAction<typeof openRTS>], state$: StateObservable<RootState>, { wdkService }: EpicDependencies): Promise<InferAction<typeof requestStep>> {

    let stepId = openRTSAction.payload.stepId;
    return requestStep(stepId);
}

async function getRequestColumnsChoicePreference([openAction, requestAction]: [InferAction<typeof openRTS>, InferAction<typeof fulfillStep>], state$: StateObservable<RootState>, { }: EpicDependencies): Promise<InferAction<typeof requestColumnsChoicePreference>> {
    return requestColumnsChoicePreference(requestAction.payload.step.answerSpec.questionName);
}

function filterRequestColumnsChoicePreferenceActions([openAction, requestAction]: [InferAction<typeof openRTS>, InferAction<typeof fulfillStep>]) {
    return openAction.payload.stepId === requestAction.payload.step.id;
}

// this probably belongs in user preference land
async function getFulfillColumnsChoicePreference([openAction, stepAction, requestAction]: [InferAction<typeof openRTS>, InferAction<typeof fulfillStep>, InferAction<typeof requestColumnsChoicePreference>], state$: StateObservable<RootState>, { wdkService }: EpicDependencies): Promise<InferAction<typeof fulfillColumnsChoice>> {
    let columns = await getResultTableColumnsPref(requestAction.payload.questionName, wdkService);
    return fulfillColumnsChoice(columns, requestAction.payload.questionName);
}

function filterFulfillColumnsChoicePreferenceActions([openAction, stepAction, requestAction]: [InferAction<typeof openRTS>, InferAction<typeof fulfillStep>, InferAction<typeof requestColumnsChoicePreference>]) {
    return (openAction.payload.stepId === stepAction.payload.step.id
        && stepAction.payload.step.answerSpec.questionName === requestAction.payload.questionName);
}

async function getFulfillColumnsChoiceUpdate(
    [openAction, stepAction, requestAction]: [InferAction<typeof openRTS>, InferAction<typeof fulfillStep>, InferAction<typeof requestColumnsChoiceUpdate>],
    state$: StateObservable<RootState>, { wdkService }: EpicDependencies)
    : Promise<InferAction<typeof fulfillColumnsChoice>> {

    setResultTableColumnsPref(requestAction.payload.questionName, wdkService, requestAction.payload.columns);
    return fulfillColumnsChoice(requestAction.payload.columns, requestAction.payload.questionName);
}

function filterFulfillColumnColumnsChoiceUpdateActions([openAction, stepAction, requestAction]: [InferAction<typeof openRTS>, InferAction<typeof fulfillStep>, InferAction<typeof requestColumnsChoiceUpdate>]) {
    return (
        openAction.payload.stepId === stepAction.payload.step.id &&
        stepAction.payload.step.answerSpec.questionName === requestAction.payload.questionName
    );
}

async function getRequestSortingPreference([openAction, requestAction]: [InferAction<typeof openRTS>, InferAction<typeof fulfillStep>], state$: StateObservable<RootState>, { }: EpicDependencies): Promise<InferAction<typeof requestSortingPreference>> {
    return requestSortingPreference(requestAction.payload.step.answerSpec.questionName);
}

function filterRequestSortingPreferenceActions([openAction, requestAction]: [InferAction<typeof openRTS>, InferAction<typeof fulfillStep>]) {
    return openAction.payload.stepId === requestAction.payload.step.id;
}

async function getFulfillSortingPreference([openAction, stepAction, requestAction]: [InferAction<typeof openRTS>, InferAction<typeof fulfillStep>, InferAction<typeof requestSortingPreference>], state$: StateObservable<RootState>, { wdkService }: EpicDependencies): Promise<InferAction<typeof fulfillSorting>> {

    let sorting = await getResultTableSortingPref(requestAction.payload.questionName, wdkService);
    return fulfillSorting(sorting, requestAction.payload.questionName);
}

function filterFullfillSortingPreferenceActions([openAction, stepAction, requestAction]: [InferAction<typeof openRTS>, InferAction<typeof fulfillStep>, InferAction<typeof requestSortingPreference>]) {
    return (
        openAction.payload.stepId === stepAction.payload.step.id &&
        stepAction.payload.step.answerSpec.questionName === requestAction.payload.questionName
    );
}

async function getFulfillSortingUpdate([openAction, stepAction, requestAction]: [InferAction<typeof openRTS>, InferAction<typeof fulfillStep>, InferAction<typeof requestSortingUpdate>], state$: StateObservable<RootState>, { wdkService }: EpicDependencies): Promise<InferAction<typeof fulfillSorting>> {
    setResultTableSortingPref(requestAction.payload.questionName, wdkService, requestAction.payload.sorting);
    return fulfillSorting(requestAction.payload.sorting, requestAction.payload.questionName);
}

function filterFulfillSortingUpdateActions([openAction, stepAction, requestAction]: [InferAction<typeof openRTS>, InferAction<typeof fulfillStep>, InferAction<typeof requestSortingUpdate>]) {
    return (
        openAction.payload.stepId === stepAction.payload.step.id &&
        stepAction.payload.step.answerSpec.questionName === requestAction.payload.questionName
    );
}

async function getRequestPageSize([openResultTableSummaryViewAction]: [InferAction<typeof openResultTableSummaryView>], state$: StateObservable<RootState>, { wdkService }: EpicDependencies): Promise<InferAction<typeof requestPageSize>> {
    return requestPageSize();
}

async function getFulfillPageSizeUpdate([requestPageSizeUpdateAction]: [InferAction<typeof requestPageSizeUpdate>], state$: StateObservable<RootState>, { wdkService }: EpicDependencies): Promise<InferAction<typeof fulfillPageSize>> {
    setResultTablePageSizePref(wdkService, requestPageSizeUpdateAction.payload.pageSize);
    return fulfillPageSize(requestPageSizeUpdateAction.payload.pageSize);
}


async function getFulfillPageSize([requestAction]: [InferAction<typeof requestPageSize>], state$: StateObservable<RootState>, { wdkService }: EpicDependencies): Promise<InferAction<typeof fulfillPageSize>> {
    // TODO: need to provide a default if no pref available
    // might want to have an object manage this
    let pageSize = getPageSizeFromPreferences(await wdkService.getCurrentUserPreferences());
    return fulfillPageSize(pageSize);
}

async function getRequestAnswer([openAction, fulfillStepAction, viewPageNumberAction, fulfillPageSizeAction, fulfillColumnsChoiceAction, fulfillSortingAction]: [InferAction<typeof openRTS>, InferAction<typeof fulfillStep>, InferAction<typeof viewPageNumber>, InferAction<typeof fulfillPageSize>, InferAction<typeof fulfillColumnsChoice>, InferAction<typeof fulfillSorting>], state$: StateObservable<RootState>, { wdkService }: EpicDependencies): Promise<InferAction<typeof requestAnswer>> {
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

async function getFulfillAnswer([openAction, requestAction]: [InferAction<typeof openRTS>,InferAction<typeof requestAnswer>], state$: StateObservable<RootState>, { wdkService }: EpicDependencies): Promise<InferAction<typeof fulfillAnswer>> {
    const r = requestAction.payload;
    const currentAnswer = state$.value[key].answer;

    // if only columns have changed, and the new columns are a subset of
    // current, we can avoid making a service call
    // if new columns are a subset of old columns
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
        return fulfillAnswer(r.stepId, r.columnsConfig, r.pagination, answer);
    }
    let answerJsonFormatConfig = {
        sorting: r.columnsConfig.sorting,
        attributes: r.columnsConfig.attributes,
        pagination: r.pagination
    };
    let answer = await wdkService.getStepAnswerJson(requestAction.payload.stepId, <AnswerJsonFormatConfig>answerJsonFormatConfig);
    return fulfillAnswer(r.stepId, r.columnsConfig, r.pagination, answer);
}

function filterFulfillAnswerActions([openAction, requestAction]: [InferAction<typeof openRTS>,InferAction<typeof requestAnswer>]) {
    return openAction.payload.stepId === requestAction.payload.stepId;
}

async function getRequestRecordsBasketStatus([openAction, answerAction]: [InferAction<typeof openRTS>,  InferAction<typeof fulfillAnswer>], state$: StateObservable<RootState>, { }: EpicDependencies): Promise<InferAction<typeof requestRecordsBasketStatus>> {
    let answer = answerAction.payload.answer;
    let primaryKeys = answerAction.payload.answer.records.map((recordInstance) => recordInstance.id);
    return requestRecordsBasketStatus(openAction.payload.stepId, answerAction.payload.pagination.offset, answerAction.payload.pagination.numRecords, answer.meta.recordClassName, primaryKeys);
}

function filterRequestRecordsBasketStatusActions([openAction, answerAction]: [InferAction<typeof openRTS>,  InferAction<typeof fulfillAnswer>]) {
    return openAction.payload.stepId === answerAction.payload.stepId;
}

async function getFulfillRecordsBasketStatus([openAction, answerAction, requestAction]: [InferAction<typeof openRTS>, InferAction<typeof fulfillAnswer>, InferAction<typeof requestRecordsBasketStatus>], state$: StateObservable<RootState>, { wdkService }: EpicDependencies): Promise<InferAction<typeof fulfillRecordsBasketStatus>> {
    let user = await wdkService.getCurrentUser();
    let recordsStatus = user.isGuest
        ? new Array(answerAction.payload.pagination.numRecords).fill(false)
        : await wdkService.getBasketStatusPk(requestAction.payload.recordClassName, requestAction.payload.basketQuery);
    return fulfillRecordsBasketStatus(openAction.payload.stepId, answerAction.payload.pagination.offset, answerAction.payload.pagination.numRecords, recordsStatus);
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

// TODO Need to handle "Add to basket" for all rows of answer!
export const observe =
    takeEpicInWindow(
        openResultTableSummaryView,
        closeResultTableSummaryView,
        combineEpics(
            mrate([openRTS], getRequestStep),
            mrate([openRTS], getFirstPageNumber),
            mrate([openRTS], getRequestPageSize),
            mrate([openRTS, fulfillStep], getRequestColumnsChoicePreference, 
                { areActionsCoherent: filterRequestColumnsChoicePreferenceActions }),
            mrate([openRTS, fulfillStep, requestColumnsChoicePreference], getFulfillColumnsChoicePreference, 
                { areActionsCoherent: filterFulfillColumnsChoicePreferenceActions }),
            mrate([openRTS, fulfillStep, requestColumnsChoiceUpdate], getFulfillColumnsChoiceUpdate, 
                { areActionsCoherent: filterFulfillColumnColumnsChoiceUpdateActions }),
            mrate([openRTS, fulfillStep], getRequestSortingPreference, 
                { areActionsCoherent: filterRequestSortingPreferenceActions }),  // need question from step
            mrate([openRTS, fulfillStep, requestSortingPreference], getFulfillSortingPreference, 
                { areActionsCoherent: filterFullfillSortingPreferenceActions }),
            mrate([openRTS, fulfillStep, requestSortingUpdate], getFulfillSortingUpdate, 
                { areActionsCoherent: filterFulfillSortingUpdateActions }),
            mrate([requestPageSize], getFulfillPageSize),
            mrate([requestPageSizeUpdate], getFulfillPageSizeUpdate),
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
                { areActionsCoherent: filterRequestAnswerActions }
            ),
            mrate([openRTS, requestAnswer], getFulfillAnswer, 
                { areActionsCoherent: filterFulfillAnswerActions }),
            mrate([openRTS, fulfillAnswer], getRequestRecordsBasketStatus, 
                { areActionsCoherent: filterRequestRecordsBasketStatusActions }),
            mrate([openRTS, fulfillAnswer, requestRecordsBasketStatus], getFulfillRecordsBasketStatus, 
                { areActionsCoherent: filterFulfillRecordBasketStatusActions }),
        ),
    );
