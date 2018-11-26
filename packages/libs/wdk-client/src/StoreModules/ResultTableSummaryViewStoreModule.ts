import { openResultTableSummaryView, requestColumnsConfig, fulfillColumnsConfig, requestPageSize,  fulfillPageSize,  requestAnswer, fulfillAnswer, requestRecordsBasketStatus, fulfillRecordsBasketStatus, viewPageNumber} from 'wdk-client/Actions/SummaryView/ResultTableSummaryViewActions';
import { requestStep, fulfillStep } from 'wdk-client/Actions/StepActions';
import { InferAction } from 'wdk-client/Utils/ActionCreatorUtils';
import { Action } from 'wdk-client/Actions';
import { Answer, AnswerJsonFormatConfig } from 'wdk-client/Utils/WdkModel';
import { getQuestionAttributesTableConfig } from 'wdk-client/Utils/UserPreferencesUtils';
import { EpicDependencies } from 'wdk-client/Core/Store';
import { Observable } from 'rxjs';
import { combineEpics} from 'redux-observable';
import {mapRequestActionsToEpic} from 'wdk-client/Utils/ActionCreatorUtils';

export const key = 'resultTableSummaryView';

export type State = {
    currentPage?: number;
    answer?: Answer;
    basketStatus?: Array<boolean>; // cardinality == pageSize
};

const initialState: State = {
};

export function reduce(state: State = initialState, action: Action): State {
    switch (action.type) {
        case fulfillAnswer.type: {
            return { ...state, answer: action.payload.answer };
        } case fulfillRecordsBasketStatus.type: {
            return { ...state, basketStatus: action.payload.basketStatus };
        } case viewPageNumber.type: {
            return {...state, currentPage: action.payload.page}
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

// these guys probably belong in user preference land
async function getRequestColumnsConfig([requestAction]: [InferAction<typeof fulfillStep>], state$: Observable<State>, { }: EpicDependencies) : Promise<InferAction<typeof requestColumnsConfig>> {
    return requestColumnsConfig(requestAction.payload.step.answerSpec.questionName);
}

async function getFulfillColumnsConfig([requestAction]: [InferAction<typeof requestColumnsConfig>], state$: Observable<State>, { wdkService }: EpicDependencies) : Promise<InferAction<typeof fulfillColumnsConfig>> {

    // TODO: if no user preference, get the default from the question!
    let columnsConfig = await getQuestionAttributesTableConfig(requestAction.payload.questionName, wdkService);
    return fulfillColumnsConfig(columnsConfig, requestAction.payload.questionName);
}

async function getFulfillPageSize([requestAction]: [InferAction<typeof requestPageSize>], state$: Observable<State>, { wdkService }: EpicDependencies) : Promise<InferAction<typeof fulfillPageSize>> {
    // TODO: need to provide a default if no pref available
    // might want to have an object manage this
    let userPrefs = await wdkService.getCurrentUserPreferences();
    return fulfillPageSize(+userPrefs.global.preference_global_items_per_page);
}

async function getRequestAnswer([openResultTableSummaryViewAction, fulfillStepAction, viewPageNumberAction, fulfillPageSizeAction, fulfillColumnsConfigAction]: [InferAction<typeof openResultTableSummaryView>, InferAction<typeof fulfillStep>, InferAction<typeof viewPageNumber>, InferAction<typeof fulfillPageSize>, InferAction<typeof fulfillColumnsConfig>], state$: Observable<State>, { wdkService }: EpicDependencies) : Promise<InferAction<typeof requestAnswer> | undefined> {
    if (fulfillStepAction.payload.step.answerSpec.questionName !== fulfillColumnsConfigAction.payload.questionName
        || openResultTableSummaryViewAction.payload.stepId != fulfillStepAction.payload.step.id) return undefined;

    let numRecords = fulfillPageSizeAction.payload.pageSize;
    let offset = numRecords * (viewPageNumberAction.payload.page - 1);
    let stepId = openResultTableSummaryViewAction.payload.stepId
    let pagination = {numRecords, offset}; 
    let columnsConfig = fulfillColumnsConfigAction.payload.columnsConfig;

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

// the mrate function is looking for a generic openRoute action, and when it sees it, 
// it uses takeUntil somehow
export const observe =
     combineEpics(
         mrate([openResultTableSummaryView], getRequestStep),
         mrate([openResultTableSummaryView], getFirstPageNumber),
     //    mrate([openResultTableSummaryView], getRequestPageSize),
         mrate([fulfillStep], getRequestColumnsConfig),
         mrate([requestColumnsConfig], getFulfillColumnsConfig),
         mrate([requestPageSize], getFulfillPageSize),
         mrate([openResultTableSummaryView, fulfillStep, viewPageNumber, fulfillPageSize, fulfillColumnsConfig], getRequestAnswer),
         mrate([requestAnswer], getFulfillAnswer),
         mrate([fulfillAnswer], getRequestRecordsBasketStatus),
         mrate([requestRecordsBasketStatus], getFulfillRecordsBasketStatus)
         );


