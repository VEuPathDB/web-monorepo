import { keyBy, mapValues } from 'lodash';
import { combineEpics, Epic } from 'redux-observable';

import {
  ActiveQuestionUpdatedAction,
  QuestionErrorAction,
  QuestionLoadedAction,
  QuestionNotFoundAction,
  UnloadQuestionAction,
  ParamErrorAction,
  ParamInitAction,
  ParamStateUpdatedAction,
  ParamsUpdatedAction,
  ParamValueUpdatedAction,
  GroupStateUpdatedAction,
  GroupVisibilityChangedAction,
  QuestionCustomNameUpdated,
  QuestionWeightUpdated,
} from './QuestionActionCreators';
import { Action, isOneOf } from '../../Utils/ActionCreatorUtils';
import {
  Parameter,
  ParameterGroup,
  QuestionWithParameters,
  RecordClass
} from "../../Utils/WdkModel";

import { observeParam, reduce as paramReducer } from "./Params";
import {
  SetFile,
  SetIdList,
  SetSourceType,
  SetStrategyId,
  SetBasketCount,
  SetStrategyList,
  SetFileParser
} from "./Params/DatasetParam";
import {
  ActiveFieldSetAction,
  FieldStateUpdatedAction,
  FiltersUpdatedAction,
  OntologyTermsInvalidated,
  SummaryCountsLoadedAction,
} from './Params/FilterParamNew/ActionCreators';
import { ExpandedListSet, SearchTermSet } from './Params/TreeBoxEnumParam';
import { observeQuestion } from './QuestionActionObservers';

interface GroupState {
  isVisible: boolean;
}

const isQuestionType = isOneOf(
  ActiveQuestionUpdatedAction,
  UnloadQuestionAction,
  ParamErrorAction,
  ParamInitAction,
  ParamStateUpdatedAction,
  ParamsUpdatedAction,
  ParamValueUpdatedAction,
  QuestionErrorAction,
  QuestionLoadedAction,
  QuestionNotFoundAction,
  GroupStateUpdatedAction,
  GroupVisibilityChangedAction,
  ActiveFieldSetAction,
  SummaryCountsLoadedAction,
  FieldStateUpdatedAction,
  FiltersUpdatedAction,
  OntologyTermsInvalidated,
  ExpandedListSet,
  SearchTermSet,
  SetBasketCount,
  SetStrategyList,
  SetFile,
  SetIdList,
  SetSourceType,
  SetStrategyId,
  SetFileParser
);

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
  if (isQuestionType(action)) {
    const { questionName } = action.payload;
    return {
      ...state,
      questions: {
        ...state.questions,
        [questionName]: reduceQuestionState(state.questions[questionName], action)
      }
    };
  }
  return state;
}

export const observe = combineEpics<Epic<Action, Action, State>>(observeQuestion, observeParam);

function reduceQuestionState(state = {} as QuestionState, action: Action): QuestionState | undefined {

  if (UnloadQuestionAction.test(action)) return undefined;

  if (ActiveQuestionUpdatedAction.test(action)) return {
    ...state,
    paramValues: action.payload.paramValues || {},
    stepId: action.payload.stepId,
    questionStatus: 'loading'
  }

  if (QuestionLoadedAction.test(action)) return {
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

  if (QuestionErrorAction.test(action)) return {
    ...state,
    questionStatus: 'error'
  };

  if (QuestionNotFoundAction.test(action)) return {
    ...state,
    questionStatus: 'not-found'
  };

  if (QuestionCustomNameUpdated.test(action)) return {
    ...state,
    customName: action.payload.customName
  }

  if (QuestionWeightUpdated.test(action)) return {
    ...state,
    weight: action.payload.weight
  }

  if (ParamValueUpdatedAction.test(action)) return {
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

  if (ParamErrorAction.test(action)) return {
    ...state,
    paramErrors: {
      ...state.paramErrors,
      [action.payload.paramName]: action.payload.error
    }
  };

  if (ParamsUpdatedAction.test(action)) {
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

  if (ParamStateUpdatedAction.test(action)) return {
    ...state,
    paramUIState: {
      ...state.paramUIState,
      [action.payload.paramName]: action.payload.paramState
    }
  };

  if (GroupVisibilityChangedAction.test(action)) return {
    ...state,
    groupUIState: {
      ...state.groupUIState,
      [action.payload.groupName]: {
        ...state.groupUIState[action.payload.groupName],
        isVisible: action.payload.isVisible
      }
    }
  }

  if (GroupStateUpdatedAction.test(action)) return {
    ...state,
    groupUIState: {
      ...state.groupUIState,
      [action.payload.groupName]: action.payload.groupState
    }
  }

  // finally, handle parameter specific actions
  return reduceParamState(state, action);
}

/**
 * Add parametersByName and groupsByName objects
 * @param question
 */
function normalizeQuestion(question: QuestionWithParameters) {
  return {
    ...question,
    parametersByName: keyBy(question.parameters, 'name'),
    groupsByName: keyBy(question.groups, 'name')
  }
}

function reduceParamState(state: QuestionState, action: any) {
  const { parameter } = action.payload;
  if (parameter) {
    return {
      ...state,
      paramUIState: {
        ...state.paramUIState,
        [parameter.name]: paramReducer(parameter, state.paramUIState[parameter.name], action)
      }
    }
  }

  return state;

}
