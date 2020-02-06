import {
  Parameter,
  ParameterValues,
  QuestionWithParameters,
  RecordClass,
  ParameterValue,
  SearchConfig
} from 'wdk-client/Utils/WdkModel';
import { AddType } from 'wdk-client/Views/Strategy/Types';
import { alert } from 'wdk-client/Utils/Platform';
import { NewStepSpec, Step } from 'wdk-client/Utils/WdkUser';
import { WdkService } from 'wdk-client/Core';
import { makeActionCreator } from 'wdk-client/Utils/ActionCreatorUtils';


export type Action =
  | UpdateActiveQuestionAction
  | QuestionLoadedAction
  | UnloadQuestionAction
  | QuestionErrorAction
  | QuestionNotFoundAction
  | UpdateCustomQuestionName
  | UpdateQuestionWeightAction
  | SubmitQuestionAction
  | UpdateParamValueAction
  | ParamErrorAction
  | UpdateParamsAction
  | InitParamAction
  | UpdateParamStateAction
  | ChangeGroupVisibilityAction
  | UpdateGroupStateAction
  | EnableSubmissionAction


type QuestionPayload<T>  = T & {
  searchName: string;
}

//==============================================================================

export const UPDATE_ACTIVE_QUESTION = 'question/update-active-question';

export interface UpdateActiveQuestionAction {
  type: typeof UPDATE_ACTIVE_QUESTION;
  payload: QuestionPayload<{
    autoRun: boolean;
    initialParamData?: Record<string, string>;
    stepId: number | undefined
  }>
}

export function updateActiveQuestion(payload: {
  searchName: string;
  autoRun: boolean,
  initialParamData?: Record<string, string>,
  stepId: number | undefined
}): UpdateActiveQuestionAction {
  return {
    type: UPDATE_ACTIVE_QUESTION,
    payload
  };
}

//==============================================================================

export const QUESTION_LOADED = 'question/question-loaded';

export interface QuestionLoadedAction {
  type: typeof QUESTION_LOADED;
  payload: QuestionPayload<{
    autoRun: boolean;
    question: QuestionWithParameters;
    recordClass: RecordClass;
    paramValues: ParameterValues;
    initialParamData?: Record<string, string>;
    wdkWeight?: number;
    stepValidation?: Step['validation'];
  }>
}

export function questionLoaded(payload: QuestionLoadedAction['payload']): QuestionLoadedAction {
  return {
    type: QUESTION_LOADED,
    payload
  };
}

//==============================================================================

export const UNLOAD_QUESTION = 'question/unload-question';

export interface UnloadQuestionAction {
  type: typeof UNLOAD_QUESTION;
  payload: QuestionPayload<{}>;
}

export function unloadQuestion(payload: QuestionPayload<{}>): UnloadQuestionAction {
  return {
    type: UNLOAD_QUESTION,
    payload
  };
}

//==============================================================================

export const QUESTION_ERROR = 'question/question-error';

export interface QuestionErrorAction {
  type: typeof QUESTION_ERROR;
  payload: QuestionPayload<{}>
}

export function questionError(payload: QuestionErrorAction['payload']): QuestionErrorAction {
  return {
    type: QUESTION_ERROR,
    payload
  };
}

//==============================================================================

export const QUESTION_NOT_FOUND = 'question/question-not-found';

export interface QuestionNotFoundAction {
  type: typeof QUESTION_NOT_FOUND;
  payload: QuestionPayload<{}>
}

export function questionNotFound(payload: QuestionNotFoundAction['payload']): QuestionNotFoundAction {
  return {
    type: QUESTION_NOT_FOUND,
    payload
  };
}

//==============================================================================

export const UPDATE_CUSTOM_QUESTION_NAME = 'question/update-custom-name';

export interface UpdateCustomQuestionName {
  type: typeof UPDATE_CUSTOM_QUESTION_NAME;
  payload: QuestionPayload<{
    customName?: string;
  }>;
}

export function updateCustomQuestionName(payload: UpdateCustomQuestionName['payload']): UpdateCustomQuestionName {
  return {
    type: UPDATE_CUSTOM_QUESTION_NAME,
    payload
  };
}

//==============================================================================

export const UPDATE_QUESTION_WEIGHT = 'question/update-weight';

export interface UpdateQuestionWeightAction {
  type: typeof UPDATE_QUESTION_WEIGHT;
  payload: QuestionPayload<{
    weight?: string;
  }>;
}

export function updateQuestionWeight(payload: UpdateQuestionWeightAction['payload']): UpdateQuestionWeightAction {
  return {
    type: UPDATE_QUESTION_WEIGHT,
    payload
  };
}

//==============================================================================

export const SUBMIT_QUESTION = 'question/submit-question';

// TODO Consider breaking these into multiple actions
type NewStrategy = {
  type: 'create-strategy'
}

type AddBinaryStep = {
  type: 'add-binary-step',
  strategyId: number,
  operatorSearchName: string,
  addType: AddType
}

type AddUnaryStep = {
  type: 'add-unary-step',
  strategyId: number,
  addType: AddType
}

type SubmitCustomForm = {
  type: 'submit-custom-form',
  stepId?: number,
  onStepSubmitted: (wdkService: WdkService, submissionSpec: NewStepSpec) => void
}

type EditStep = {
  type: 'edit-step',
  strategyId: number,
  stepId: number,
  previousSearchConfig: SearchConfig
}

export type SubmissionMetadata = NewStrategy | AddBinaryStep | AddUnaryStep | SubmitCustomForm | EditStep

export interface SubmitQuestionAction {
  type: typeof SUBMIT_QUESTION;
  payload: QuestionPayload<{
    submissionMetadata: SubmissionMetadata;
    autoRun?: boolean;
  }>;
}

export const submitQuestion = makeActionCreator(
  SUBMIT_QUESTION,
  (payload: QuestionPayload<{
    submissionMetadata: SubmissionMetadata,
    autoRun?: boolean
  }>) => payload
)

//==============================================================================

export const UPDATE_PARAM_VALUE = 'question/update-param-value';

export interface UpdateParamValueAction {
  type: typeof UPDATE_PARAM_VALUE;
  payload: QuestionPayload<{
    parameter: Parameter;
    paramValues: ParameterValues;
    paramValue: ParameterValue;
  }>;
}

export function updateParamValue(payload: UpdateParamValueAction['payload']): UpdateParamValueAction {
  return {
    type: UPDATE_PARAM_VALUE,
    payload
  };
}

//==============================================================================

export const PARAM_ERROR = 'question/param-error';

export interface ParamErrorAction {
  type: typeof PARAM_ERROR;
  payload: QuestionPayload<{
    error: string;
    paramName: string;
  }>;
}

export function paramError(payload: ParamErrorAction['payload']): ParamErrorAction {
  return {
    type: PARAM_ERROR,
    payload
  };
}

//==============================================================================

export const UPDATE_PARAMS = 'question/update-params';

export interface UpdateParamsAction {
  type: typeof UPDATE_PARAMS;
  payload: QuestionPayload<{
    parameters: Parameter[];
  }>;
}

export function updateParams(payload: UpdateParamsAction['payload']): UpdateParamsAction {
  return {
    type: UPDATE_PARAMS,
    payload
  };
}

//==============================================================================

export const INIT_PARAM = 'question/init-param';

export interface InitParamAction {
  type: typeof INIT_PARAM;
  payload: QuestionPayload<{
    parameter: Parameter;
    paramValues: ParameterValues;
    initialParamData?: Record<string, string>;
  }>;
}

export function initParam(payload: InitParamAction['payload']): InitParamAction {
  return {
    type: INIT_PARAM,
    payload
  };
}

//==============================================================================

export const UPDATE_PARAM_STATE = 'question/update-param-state';

export interface UpdateParamStateAction {
  type: typeof UPDATE_PARAM_STATE;
  payload: QuestionPayload<{
    paramName: string;
    paramState: any;
  }>;
}

export function updateParamState(payload: UpdateParamStateAction['payload']): UpdateParamStateAction {
  return {
    type: UPDATE_PARAM_STATE,
    payload
  };
}

//==============================================================================

export const CHANGE_GROUP_VISIBILITY = 'question/change-group-visibility';

export interface ChangeGroupVisibilityAction {
  type: typeof CHANGE_GROUP_VISIBILITY;
  payload: QuestionPayload<{
    groupName: string;
    isVisible: boolean;
  }>;
}

export function changeGroupVisibility(payload: ChangeGroupVisibilityAction['payload']): ChangeGroupVisibilityAction {
  return {
    type: CHANGE_GROUP_VISIBILITY,
    payload
  };
}

//==============================================================================

export const UPDATE_GROUP_STATE = 'question/update-group-state';

export interface UpdateGroupStateAction {
  type: typeof UPDATE_GROUP_STATE;
  payload: {
    groupName: string;
    groupState: any;
  };
}

export function updateGroupState(payload: UpdateGroupStateAction['payload']): UpdateGroupStateAction {
  return {
    type: UPDATE_GROUP_STATE,
    payload
  };
}

//==============================================================================

export const ENABLE_SUBMISSION = 'question/enable-submission';

export interface EnableSubmissionAction {
  type: typeof ENABLE_SUBMISSION;
  payload: QuestionPayload<{ stepValidation?: Step['validation'] }>;
}

function enableSubmission(payload: EnableSubmissionAction['payload']): EnableSubmissionAction {
  return {
    type: ENABLE_SUBMISSION,
    payload
  };
}

export const reportSubmissionError = (searchName: string, error: any, wdkService: WdkService): EnableSubmissionAction => {
  const isValidationError = 'status' in error && 'response' in error && error.status === 422;
  const stepValidation = isValidationError ? JSON.parse(error.response) : undefined;

  if (!isValidationError) {
    alert('Oops... something went wrong!', 'An error was encountered.');
    wdkService.submitErrorIfNot500(error);
  }

  return enableSubmission({ searchName, stepValidation });
};
