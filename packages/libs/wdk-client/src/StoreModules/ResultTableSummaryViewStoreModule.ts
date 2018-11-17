import { requestStep, fulfillStep, requestColumnsConfig, fulfillColumnsConfig, requestPageSize,  fulfillPageSize,  requestAnswer, fulfillAnswer, requestRecordsBasketStatus, fulfillRecordsBasketStatus, viewPage} from 'wdk-client/Actions/SummaryView/ResultTableSummaryViewActions';
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
    recordClassName?: string;
    currentPage?: number;
    answer?: Answer;
    basketStatus?: Array<boolean>; // cardinality == pageSize
};

const initialState: State = {
};

export function reduce(state: State = initialState, action: Action): State {
    switch (action.type) {
        case fulfillStep.type: {
            return { ...state, recordClassName: action.payload.step.recordClassName };
        } case fulfillAnswer.type: {
            return { ...state, answer: action.payload.answer };
        } case fulfillRecordsBasketStatus.type: {
            return { ...state, basketStatus: action.payload.basketStatus };
        } case viewPage.type: {
            return {...state, currentPage: action.payload.page}
        }
        default: {
            return state;
        }
    }
}

async function getFulfillStep([requestAction]: [InferAction<typeof requestStep>], state$: Observable<State>, { wdkService }: EpicDependencies) : Promise<InferAction<typeof fulfillStep>> {

    let step = await wdkService.findStep(requestAction.payload.stepId);
    return fulfillStep(step);
}

async function getRequestColumnsConfig([requestAction]: [InferAction<typeof fulfillStep>], state$: Observable<State>, { }: EpicDependencies) : Promise<InferAction<typeof requestColumnsConfig>> {
    return requestColumnsConfig(requestAction.payload.step.answerSpec.questionName);
}

async function getFulfillColumnsConfig([requestAction]: [InferAction<typeof requestColumnsConfig>], state$: Observable<State>, { wdkService }: EpicDependencies) : Promise<InferAction<typeof fulfillColumnsConfig>> {

    let columnsConfig = await getQuestionAttributesTableConfig(requestAction.payload.questionName, wdkService);
    return fulfillColumnsConfig(columnsConfig);
}

async function getFulfillPageSize([requestAction]: [InferAction<typeof requestPageSize>], state$: Observable<State>, { wdkService }: EpicDependencies) : Promise<InferAction<typeof fulfillPageSize>> {
    let userPrefs = await wdkService.getCurrentUserPreferences();
    return fulfillPageSize(+userPrefs.global.preference_global_items_per_page);
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

export const observe =
     combineEpics(
         mapRequestActionsToEpic([requestStep], getFulfillStep),
         mapRequestActionsToEpic([fulfillStep], getRequestColumnsConfig),
         mapRequestActionsToEpic([requestColumnsConfig], getFulfillColumnsConfig),
         mapRequestActionsToEpic([requestPageSize], getFulfillPageSize),
         mapRequestActionsToEpic([requestAnswer], getFulfillAnswer),
         mapRequestActionsToEpic([fulfillAnswer], getRequestRecordsBasketStatus),
         mapRequestActionsToEpic([requestRecordsBasketStatus], getFulfillRecordsBasketStatus)
         );


