import {
  Parameter,
  ParameterValues,
  QuestionWithParameters,
  RecordClass,
  ParameterValue,
  SearchConfig
} from 'wdk-client/Utils/WdkModel';
import { AddType } from 'wdk-client/Views/Strategy/Types';


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


type QuestionPayload<T>  = T & {
  searchName: string;
}

//==============================================================================

export const UPDATE_ACTIVE_QUESTION = 'question/update-active-question';

export interface UpdateActiveQuestionAction {
  type: typeof UPDATE_ACTIVE_QUESTION;
  payload: QuestionPayload<{
    paramValues?: ParameterValues;
    stepId: number | undefined
  }>
}

export function updateActiveQuestion(payload: {
  searchName: string;
  paramValues?: ParameterValues,
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
    question: QuestionWithParameters;
    recordClass: RecordClass;
    paramValues: ParameterValues;
    wdkWeight?: number;
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

type EditStep = {
  type: 'edit-step',
  strategyId: number,
  stepId: number,
  previousSearchConfig: SearchConfig
}

type AddCustomStep = {
  type: 'add-custom-step',
  strategyId: number,
  addType: AddType,
  onStepAdded: () => void;
}

export type SubmissionMetadata = NewStrategy | AddBinaryStep | AddUnaryStep | EditStep | AddCustomStep

export interface SubmitQuestionAction {
  type: typeof SUBMIT_QUESTION;
  payload: QuestionPayload<{ submissionMetadata: SubmissionMetadata }>;
}

export function submitQuestion(payload: SubmitQuestionAction['payload']): SubmitQuestionAction {
  return {
    type: SUBMIT_QUESTION,
    payload
  };
}

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
