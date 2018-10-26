import { makeActionCreator } from 'wdk-client/Utils/ActionCreatorUtils';
import { Parameter, ParameterValues, QuestionWithParameters, RecordClass, ParameterValue } from 'wdk-client/Utils/WdkModel';

type BasePayload = { questionName: string; }

export const ActiveQuestionUpdatedAction = makeActionCreator<
  BasePayload & {
    paramValues?: ParameterValues;
    stepId: number | undefined;
  },
  'quesiton/active-question-updated'
>('quesiton/active-question-updated');

export const QuestionLoadedAction = makeActionCreator<
  BasePayload & {
    question: QuestionWithParameters;
    recordClass: RecordClass;
    paramValues: ParameterValues;
  },
  'question/question-loaded'
>('question/question-loaded');

export const UnloadQuestionAction = makeActionCreator<BasePayload, 'question/unload-question'>('question/unload-question');

export const QuestionErrorAction = makeActionCreator<BasePayload, 'question/question-error'>('question/question-error');

export const QuestionNotFoundAction = makeActionCreator<BasePayload, 'question/question-not-found'>('question/question-not-found');

export const QuestionCustomNameUpdated =
  makeActionCreator<BasePayload & { customName?: string }, 'question/custom-name-updated'>('question/custom-name-updated');

export const QuestionWeightUpdated =
  makeActionCreator<BasePayload & { weight?: string }, 'question/weight-updated'>('question/weight-updated');

export const QuestionSubmitted =
  makeActionCreator<BasePayload, 'question/question-submitted'>('question/question-submitted');

export const ParamValueUpdatedAction =
  makeActionCreator<BasePayload & { parameter: Parameter, paramValues: ParameterValues, paramValue: ParameterValue }, 'question/param-value-update'>('question/param-value-update');

export const ParamErrorAction =
  makeActionCreator<BasePayload & { error: string, paramName: string }, 'question/param-error'>('question/param-error');

export const ParamsUpdatedAction =
  makeActionCreator<BasePayload & { parameters: Parameter[] }, 'question/params-updated' >('question/params-updated');

export const ParamInitAction =
  makeActionCreator<BasePayload & { parameter: Parameter; paramValues: ParameterValues }, 'question/param-init'>('question/param-init');

export const ParamStateUpdatedAction =
  makeActionCreator<BasePayload & { paramName: string; paramState: any }, 'question/param-state-updated'>('question/param-state-updated');

export const GroupVisibilityChangedAction =
  makeActionCreator<BasePayload & { groupName: string; isVisible: boolean; }, 'question/group-visibility-change'>('question/group-visibility-change');

export const GroupStateUpdatedAction =
  makeActionCreator<BasePayload & { groupName: string; groupState: any; }, 'question/group-state-update'>('question/group-state-update');