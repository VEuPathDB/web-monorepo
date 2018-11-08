import { keyBy, mapValues } from 'lodash';
import { StateObservable, ActionsObservable } from 'redux-observable';
import { merge, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  UNLOAD_QUESTION,
  UPDATE_ACTIVE_QUESTION,
  QUESTION_LOADED,
  QUESTION_ERROR,
  QUESTION_NOT_FOUND,
  UPDATE_CUSTOM_QUESTION_NAME,
  UPDATE_QUESTION_WEIGHT,
  UPDATE_PARAM_VALUE,
  PARAM_ERROR,
  UPDATE_PARAMS,
  UPDATE_PARAM_STATE,
  CHANGE_GROUP_VISIBILITY,
  UPDATE_GROUP_STATE,
} from 'wdk-client/Actions/QuestionActions';

import {
  Parameter,
  ParameterGroup,
  QuestionWithParameters,
  RecordClass
} from 'wdk-client/Utils/WdkModel';

import {
  observeParam,
  reduce as paramReducer
} from 'wdk-client/Views/Question/Params';

import { observeQuestion } from 'wdk-client/Views/Question/QuestionActionObservers';
import { EpicDependencies } from 'wdk-client/Core/Store';
import { Action } from 'wdk-client/Actions';

export const key = 'question';

interface GroupState {
  isVisible: boolean;
}

export type QuestionState = {
  questionStatus: 'loading' | 'error' | 'not-found' | 'complete';
  question: QuestionWithParameters & {
    parametersByName: Record<string, Parameter>;
    groupsByName: Record<string, ParameterGroup>
  };
  recordClass: RecordClass;
  paramValues: Record<string, string>;
  paramUIState: Record<string, any>;
  groupUIState: Record<string, GroupState>;
  paramErrors: Record<string, string | undefined>;
  stepId: number | undefined;
  weight?: string;
  customName?: string;
}

export type State = {
  questions: Record<string, QuestionState | undefined>;
}

const initialState: State = {
  questions: {}
}

export function reduce(state: State = initialState, action: Action): State {
  if ('payload' in action && action.payload != null && typeof action.payload === 'object') {
    if ('questionName' in action.payload) {
      const { questionName } = action.payload;
      const questionState = reduceQuestionState(state.questions[questionName], action);
      if (questionState !== state.questions[questionName]) {
        return {
          ...state,
          questions: {
            ...state.questions,
            [questionName]: questionState
          }
        };
      }
    }
  }
  return state;
}

export const observe = (action$: ActionsObservable<Action>, state$: StateObservable<any>, dependencies: EpicDependencies) => {
  const questionState$ = new StateObservable(
    state$.pipe(
      map(state => state[key])
    ) as Subject<State>,
    state$.value[key]
  );

  return merge(
    observeQuestion(action$, questionState$, dependencies),
    observeParam(action$, questionState$, dependencies)
  );
};

function reduceQuestionState(state = {} as QuestionState, action: Action): QuestionState | undefined {
  switch(action.type) {

    case UNLOAD_QUESTION:
      return undefined;

    case UPDATE_ACTIVE_QUESTION:
      return {
        ...state,
        paramValues: action.payload.paramValues || {},
        stepId: action.payload.stepId,
        questionStatus: 'loading'
      }

    case QUESTION_LOADED:
      return {
        ...state,
        questionStatus: 'complete',
        question: normalizeQuestion(action.payload.question),
        recordClass: action.payload.recordClass,
        paramValues: action.payload.paramValues,
        paramErrors: action.payload.question.parameters.reduce((paramValues, param) =>
          Object.assign(paramValues, { [param.name]: undefined }), {}),
        paramUIState: action.payload.question.parameters.reduce((paramUIState, parameter) =>
          Object.assign(paramUIState, { [parameter.name]: paramReducer(parameter, undefined, { type: '@@parm-stub@@' }) }), {}),
        groupUIState: action.payload.question.groups.reduce((groupUIState, group) =>
          Object.assign(groupUIState, { [group.name]: { isVisible: group.isVisible }}), {})
      }

    case QUESTION_ERROR:
      return {
        ...state,
        questionStatus: 'error'
      };

    case QUESTION_NOT_FOUND:
      return {
        ...state,
        questionStatus: 'not-found'
      };

    case UPDATE_CUSTOM_QUESTION_NAME:
      return {
        ...state,
        customName: action.payload.customName
      };

    case UPDATE_QUESTION_WEIGHT:
      return {
        ...state,
        weight: action.payload.weight
      }

    case UPDATE_PARAM_VALUE:
       return {
        ...state,
        paramValues: {
          ...state.paramValues,
          [action.payload.parameter.name]: action.payload.paramValue
        },
        paramErrors: {
          ...state.paramErrors,
          [action.payload.parameter.name]: undefined
        }
      };

    case PARAM_ERROR:
      return {
        ...state,
        paramErrors: {
          ...state.paramErrors,
          [action.payload.paramName]: action.payload.error
        }
      };

    case UPDATE_PARAMS: {
      const newParamsByName = keyBy(action.payload.parameters, 'name');
      const newParamValuesByName = mapValues(newParamsByName, param => param.defaultValue || '');
      const newParamErrors = mapValues(newParamsByName, () => undefined);
      // merge updated parameters into quesiton and reset their values
      return {
        ...state,
        paramValues: {
          ...state.paramValues,
          ...newParamValuesByName
        },
        paramErrors: {
          ...state.paramErrors,
          ...newParamErrors
        },
        question: {
          ...state.question,
          parametersByName: {
            ...state.question.parametersByName,
            ...newParamsByName
          },
          parameters: state.question.parameters
            .map(parameter => newParamsByName[parameter.name] || parameter)
        }
      };
    }

    case UPDATE_PARAM_STATE:
       return {
        ...state,
        paramUIState: {
          ...state.paramUIState,
          [action.payload.paramName]: action.payload.paramState
        }
      };

    case CHANGE_GROUP_VISIBILITY:
       return {
        ...state,
        groupUIState: {
          ...state.groupUIState,
          [action.payload.groupName]: {
            ...state.groupUIState[action.payload.groupName],
            isVisible: action.payload.isVisible
          }
        }
      };

    case UPDATE_GROUP_STATE:
      return {
        ...state,
        groupUIState: {
          ...state.groupUIState,
          [action.payload.groupName]: action.payload.groupState
        }
      };

    // finally, handle parameter specific actions
    default:
      return reduceParamState(state, action);
  }

}

function reduceParamState(state: QuestionState, action: Action) {
  if ('payload' in action && action.payload != null && typeof action.payload === 'object' && 'parameter' in action.payload) {
    const { parameter } = action.payload;
    if (parameter) {
      const paramState = paramReducer(parameter, state.paramUIState[parameter.name], action);
      if (paramState !== state.paramUIState[parameter.name]) {
        return {
          ...state,
          paramUIState: {
            ...state.paramUIState,
            [parameter.name]: paramState
          }
        }
      }
    }
  }

  return state;
}

/**
 * Add parametersByName and groupsByName objects
 */
function normalizeQuestion(question: QuestionWithParameters) {
  return {
    ...question,
    parametersByName: keyBy(question.parameters, 'name'),
    groupsByName: keyBy(question.groups, 'name')
  }
}
