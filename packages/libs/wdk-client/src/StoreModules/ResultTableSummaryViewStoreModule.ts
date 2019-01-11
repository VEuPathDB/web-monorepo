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
import { mapRequestActionsToEpic, takeEpicInWindow } from 'wdk-client/Utils/ActionCreatorUtils';

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

async function getRequestColumnsChoicePreference([openAction, requestAction]: [InferAction<typeof openRTS>, InferAction<typeof fulfillStep>], state$: Observable<State>, { }: EpicDependencies): Promise<InferAction<typeof requestColumnsChoicePreference> | undefined> {
    if (openAction.payload.stepId != requestAction.payload.step.id) return undefined;
    return requestColumnsChoicePreference(requestAction.payload.step.answerSpec.questionName);
}

// this probably belongs in user preference land
async function getFulfillColumnsChoicePreference([openAction, stepAction, requestAction]: [InferAction<typeof openRTS>, InferAction<typeof fulfillStep>, InferAction<typeof requestColumnsChoicePreference>], state$: Observable<State>, { wdkService }: EpicDependencies): Promise<InferAction<typeof fulfillColumnsChoice> | undefined> {

    if (openAction.payload.stepId != stepAction.payload.step.id
        || stepAction.payload.step.answerSpec.questionName != requestAction.payload.questionName) return undefined;
    let summaryTableConfigPref = await getSummaryTableConfigUserPref(requestAction.payload.questionName, wdkService);
    return fulfillColumnsChoice(summaryTableConfigPref.columns, requestAction.payload.questionName);
}

async function getFulfillColumnsChoiceUpdate(
    [openAction, stepAction, requestAction]: [InferAction<typeof openRTS>, InferAction<typeof fulfillStep>, InferAction<typeof requestColumnsChoiceUpdate>],
    state$: Observable<State>, { wdkService }: EpicDependencies)
    : Promise<InferAction<typeof fulfillColumnsChoice> | undefined> {

    if (openAction.payload.stepId != stepAction.payload.step.id
        || stepAction.payload.step.answerSpec.questionName != requestAction.payload.questionName) return undefined;
    await setResultTableColumnsPref(requestAction.payload.questionName, wdkService, requestAction.payload.columns);
    return fulfillColumnsChoice(requestAction.payload.columns, requestAction.payload.questionName);
}

async function getRequestSortingPreference([openAction, requestAction]: [InferAction<typeof openRTS>, InferAction<typeof fulfillStep>], state$: Observable<State>, { }: EpicDependencies): Promise<InferAction<typeof requestSortingPreference> | undefined> {
    if (openAction.payload.stepId != requestAction.payload.step.id) return undefined;
    return requestSortingPreference(requestAction.payload.step.answerSpec.questionName);
}

async function getFulfillSortingPreference([openAction, stepAction, requestAction]: [InferAction<typeof openRTS>, InferAction<typeof fulfillStep>, InferAction<typeof requestSortingPreference>], state$: Observable<State>, { wdkService }: EpicDependencies): Promise<InferAction<typeof fulfillSorting> | undefined> {

    if (openAction.payload.stepId != stepAction.payload.step.id
        || stepAction.payload.step.answerSpec.questionName != requestAction.payload.questionName) return undefined;

    let summaryTableConfigPref = await getSummaryTableConfigUserPref(requestAction.payload.questionName, wdkService);
    return fulfillSorting(summaryTableConfigPref.sorting, requestAction.payload.questionName);
}

async function getFulfillSortingUpdate([openAction, stepAction, requestAction]: [InferAction<typeof openRTS>, InferAction<typeof fulfillStep>, InferAction<typeof requestSortingUpdate>], state$: Observable<State>, { wdkService }: EpicDependencies): Promise<InferAction<typeof fulfillSorting> | undefined> {

    if (openAction.payload.stepId != stepAction.payload.step.id
        || stepAction.payload.step.answerSpec.questionName != requestAction.payload.questionName) return undefined;
    await setResultTableSortingPref(requestAction.payload.questionName, wdkService, requestAction.payload.sorting);
    return fulfillSorting(requestAction.payload.sorting, requestAction.payload.questionName);
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

async function getRequestAnswer([openAction, fulfillStepAction, viewPageNumberAction, fulfillPageSizeAction, fulfillColumnsChoiceAction, fulfillSortingAction]: [InferAction<typeof openRTS>, InferAction<typeof fulfillStep>, InferAction<typeof viewPageNumber>, InferAction<typeof fulfillPageSize>, InferAction<typeof fulfillColumnsChoice>, InferAction<typeof fulfillSorting>], state$: Observable<State>, { wdkService }: EpicDependencies): Promise<InferAction<typeof requestAnswer> | undefined> {
    if (fulfillStepAction.payload.step.answerSpec.questionName !== fulfillColumnsChoiceAction.payload.questionName
        || openAction.payload.stepId != fulfillStepAction.payload.step.id
        || fulfillStepAction.payload.step.answerSpec.questionName != fulfillColumnsChoiceAction.payload.questionName
        || fulfillStepAction.payload.step.answerSpec.questionName != fulfillSortingAction.payload.questionName) return undefined;

    let numRecords = fulfillPageSizeAction.payload.pageSize;
    let offset = numRecords * (viewPageNumberAction.payload.page - 1);
    let stepId = openAction.payload.stepId
    let pagination = { numRecords, offset };
    let attributes = fulfillColumnsChoiceAction.payload.columns;
    let sorting = fulfillSortingAction.payload.sorting;
    let columnsConfig: AttributesConfig = { attributes, sorting };
    return requestAnswer(stepId, columnsConfig, pagination);
}

async function getFulfillAnswer([openAction, requestAction]: [InferAction<typeof openRTS>,InferAction<typeof requestAnswer>], state$: Observable<State>, { wdkService }: EpicDependencies): Promise<InferAction<typeof fulfillAnswer> | undefined> {
    if (openAction.payload.stepId != requestAction.payload.stepId) return undefined;
    let answerJsonFormatConfig = [
        requestAction.payload.columnsConfig.sorting,
        requestAction.payload.columnsConfig.attributes,
        requestAction.payload.pagination
    ];
    let r = requestAction.payload;
    let answer = await wdkService.getStepAnswerJson(requestAction.payload.stepId, <AnswerJsonFormatConfig>answerJsonFormatConfig);
    return fulfillAnswer(r.stepId, r.columnsConfig, r.pagination, answer);
}

async function getRequestRecordsBasketStatus([openAction, answerAction]: [InferAction<typeof openRTS>,  InferAction<typeof fulfillAnswer>], state$: Observable<State>, { }: EpicDependencies): Promise<InferAction<typeof requestRecordsBasketStatus> | undefined> {
    if (openAction.payload.stepId != answerAction.payload.stepId) return undefined;
    let answer = answerAction.payload.answer;
    let primaryKeys = answerAction.payload.answer.records.map((recordInstance) => recordInstance.id);
    return requestRecordsBasketStatus(openAction.payload.stepId, answerAction.payload.pagination.offset, answerAction.payload.pagination.numRecords, answer.meta.recordClassName, primaryKeys);
}

async function getFulfillRecordsBasketStatus([openAction, answerAction, requestAction]: [InferAction<typeof openRTS>, InferAction<typeof fulfillAnswer>, InferAction<typeof requestRecordsBasketStatus>], state$: Observable<State>, { wdkService }: EpicDependencies): Promise<InferAction<typeof fulfillRecordsBasketStatus> | undefined> {
    let rp = requestAction.payload;
    let ap = answerAction.payload;
    let op = openAction.payload;
    if (op.stepId != rp.stepId
        || op.stepId != ap.stepId
        || ap.pagination.offset != rp.pageNumber
        || ap.pagination.numRecords != rp.pageSize) return undefined;
    let recordsStatus = await wdkService.getBasketStatusPk(requestAction.payload.recordClassName, requestAction.payload.basketQuery);
    return fulfillRecordsBasketStatus(openAction.payload.stepId, answerAction.payload.pagination.offset, answerAction.payload.pagination.numRecords,recordsStatus);
}
const mrate = mapRequestActionsToEpic;

export const observe =
    takeEpicInWindow<State>(
        openResultTableSummaryView,
        closeResultTableSummaryView,
        combineEpics(
            mrate([openRTS], getRequestStep),
            mrate([openRTS], getFirstPageNumber),
            mrate([openRTS], getRequestPageSize),
            mrate([openRTS, fulfillStep], getRequestColumnsChoicePreference),
            mrate([openRTS, fulfillStep, requestColumnsChoicePreference], getFulfillColumnsChoicePreference),
            mrate([openRTS, fulfillStep, requestColumnsChoiceUpdate], getFulfillColumnsChoiceUpdate),
            mrate([openRTS, fulfillStep], getRequestSortingPreference),  // need question from step
            mrate([openRTS, fulfillStep, requestSortingPreference], getFulfillSortingPreference),
            mrate([openRTS, fulfillStep, requestSortingUpdate], getFulfillSortingUpdate),
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
            ),
            mrate([openRTS, requestAnswer], getFulfillAnswer),
            mrate([openRTS, fulfillAnswer], getRequestRecordsBasketStatus),
            mrate([openRTS, fulfillAnswer, requestRecordsBasketStatus], getFulfillRecordsBasketStatus),
        ),
    );
