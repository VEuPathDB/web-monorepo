import { requestColumnsConfig, fulfillColumnsConfig, requestPageSize,  fulfillPageSize,  requestAnswer, fulfillAnswer, requestRecordsBasketStatus, fulfillRecordsBasketStatus} from 'wdk-client/Actions/SummaryView/ResultTableSummaryViewActions';
import { InferAction } from 'wdk-client/Utils/ActionCreatorUtils';
import { Action } from 'wdk-client/Actions';
import { Answer, AnswerJsonFormatConfig } from 'wdk-client/Utils/WdkModel';
import { getQuestionAttributesTableConfig } from 'wdk-client/Utils/UserPreferencesUtils';
import { EpicDependencies } from 'wdk-client/Core/Store';
import { Observable } from 'rxjs';
import { combineEpics} from 'redux-observable';
import {mapRequestActionToEpic} from 'wdk-client/Utils/ActionCreatorUtils';

export const key = 'resultTableSummaryView';

export type State = {
    stepId?: number;
    currentPage?: number;
    answer?: Answer;
    basketStatus?: Array<boolean>; // cardinality == pageSize
    error?: Error
};

const initialState: State = {
};

export function reduce(state: State = initialState, action: Action): State {
    switch (action.type) {
        case requestColumnsConfig.type: {
            return { ...state, stepId: action.payload.stepId };
        } case fulfillAnswer.type: {
            return { ...state, answer: action.payload.answer };
        } case fulfillRecordsBasketStatus.type: {
            return { ...state, basketStatus: action.payload.basketStatus };
        }
        default: {
            return state;
        }
    }
}

async function getColumnConfig(requestAction: InferAction<typeof requestColumnsConfig>, state$: Observable<State>, { wdkService }: EpicDependencies) : Promise<InferAction<typeof fulfillColumnsConfig>> {

    let step = await wdkService.findStep(requestAction.payload.stepId);
    let questionName = step.answerSpec.questionName;
    let columnsConfig = await getQuestionAttributesTableConfig(questionName, wdkService);
    return fulfillColumnsConfig(columnsConfig);
}

async function getPageSize(requestAction: InferAction<typeof requestPageSize>, state$: Observable<State>, { wdkService }: EpicDependencies) : Promise<InferAction<typeof fulfillPageSize>> {
    let userPrefs = await wdkService.getCurrentUserPreferences();
    return fulfillPageSize(+userPrefs.global.preference_global_items_per_page);
}

async function getAnswer(requestAction:  InferAction<typeof requestAnswer>, state$: Observable<State>, { wdkService }: EpicDependencies) : Promise<InferAction<typeof fulfillAnswer>> {
    let answerJsonFormatConfig = [
        requestAction.payload.columnsConfig.sorting,
        requestAction.payload.columnsConfig.attributes
    ];
    let answer = await wdkService.getStepAnswerJson(requestAction.payload.stepId, <AnswerJsonFormatConfig>answerJsonFormatConfig);
    return fulfillAnswer(answer);
}

async function getRecordsBasketStatus(requestAction: InferAction<typeof requestRecordsBasketStatus>, state$: Observable<State>, { wdkService }: EpicDependencies) : Promise<InferAction<typeof fulfillRecordsBasketStatus>> {
    let recordsStatus = await wdkService.getBasketStatusPk(requestAction.payload.recordClassName, requestAction.payload.basketQuery);
    return fulfillRecordsBasketStatus(recordsStatus);
}

export const observe =
     combineEpics(
         mapRequestActionToEpic(requestColumnsConfig, getColumnConfig),
         mapRequestActionToEpic(requestPageSize, getPageSize),
         mapRequestActionToEpic(requestAnswer, getAnswer),
         mapRequestActionToEpic(requestRecordsBasketStatus, getRecordsBasketStatus)
         );


