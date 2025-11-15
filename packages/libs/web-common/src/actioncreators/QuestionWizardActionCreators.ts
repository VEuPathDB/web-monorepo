import {
  Question,
  QuestionWithParameters,
  RecordClass,
  Parameter,
} from '@veupathdb/wdk-client/lib/Utils/WdkModel';

// load quesiton
export const QUESTION_LOADING = 'quesiton-wizard/question-loading';
export const QUESTION_LOADED = 'question-wizard/question-loaded';
export const QUESTION_LOAD_ERROR = 'question-wizard/quesiton-load-error';

// load group counts
export const GROUP_COUNTS_LOADING = 'question-wizard/group-counts-loading';
export const GROUP_COUNTS_LOADED = 'quesiton-wizard/group-counts-loaded';
export const GROUP_COUNTS_LOAD_ERROR =
  'question-wizard/group-counts-load-error';

// update param value
export const PARAM_VALUE_UPDATED = 'question-wizard/param-value-updated';

export const DEPENDENT_PARAMS_LOADING =
  'question-wizard/dependent-params-loading';
export const DEPENDENT_PARAMS_LOADED =
  'question-wizard/dependent-params-loaded';
export const DEPENDENT_PARAMS_ERROR = 'question-wizard/dependent-params-error';

// param loading data (e.g., filter param counts, summaries, etc)
export const PARAM_DATA_LOADING = 'quesiton-wizard/param-data-loading';
export const PARAM_DATA_LOADED = 'question-wizard/param-data-loaded';
export const PARAM_DATA_LOAD_ERROR = 'question-wizard/param-data-load-error';

// Type definitions
export type ParamValues = Record<string, string>;

// Action type interfaces
export interface QuestionLoadingAction {
  type: typeof QUESTION_LOADING;
  payload: {
    questionName: string;
  };
}

export interface QuestionLoadedAction {
  type: typeof QUESTION_LOADED;
  payload: {
    question: QuestionWithParameters;
    recordClass: RecordClass;
    paramValues?: ParamValues;
  };
}

export interface QuestionLoadErrorAction {
  type: typeof QUESTION_LOAD_ERROR;
  payload: {
    questionName: string;
    message: string;
  };
}

export interface GroupCountsLoadingAction {
  type: typeof GROUP_COUNTS_LOADING;
  payload: any;
}

export interface GroupCountsLoadedAction {
  type: typeof GROUP_COUNTS_LOADED;
  payload: any;
}

export interface GroupCountsLoadErrorAction {
  type: typeof GROUP_COUNTS_LOAD_ERROR;
  payload: any;
}

export interface ParamValueUpdatedAction {
  type: typeof PARAM_VALUE_UPDATED;
  payload: {
    questionName: string;
    paramName: string;
    paramValue: string;
    contextParamValues: ParamValues;
  };
}

export interface DependentParamsLoadingAction {
  type: typeof DEPENDENT_PARAMS_LOADING;
  payload: {
    questionName: string;
    paramName: string;
    paramValue: string;
    contextParamValues: ParamValues;
  };
}

export interface DependentParamsLoadedAction {
  type: typeof DEPENDENT_PARAMS_LOADED;
  payload: {
    questionName: string;
    paramName: string;
    paramValue: string;
    updatedParameters: Parameter[];
    contextParamValues: ParamValues;
  };
}

export interface DependentParamsErrorAction {
  type: typeof DEPENDENT_PARAMS_ERROR;
  payload: {
    questionName: string;
    message: string;
  };
}

export interface ParamDataLoadingAction {
  type: typeof PARAM_DATA_LOADING;
  payload: any;
}

export interface ParamDataLoadedAction {
  type: typeof PARAM_DATA_LOADED;
  payload: any;
}

export interface ParamDataLoadErrorAction {
  type: typeof PARAM_DATA_LOAD_ERROR;
  payload: any;
}

/**
 * Load question resource identified by `questionName`.
 */
export const loadQuestion =
  (questionName: string, paramValues?: ParamValues) =>
  (dispatch: any, { wdkService }: any) => {
    dispatch({
      type: QUESTION_LOADING,
      payload: { questionName },
    });
    fetchQuestionResources(wdkService, questionName).then(
      ({ question, recordClass }) => {
        dispatch({
          type: QUESTION_LOADED,
          payload: { question, recordClass, paramValues },
        });
      },
      (error: Error) => {
        dispatch({
          type: QUESTION_LOAD_ERROR,
          payload: {
            questionName,
            message: error.message,
          },
        });
      }
    );
  };

/**
 * Fetch Question and associated RecordClass idenitified by `questionName`
 */
function fetchQuestionResources(
  wdkService: any,
  questionName: string
): Promise<{ question: QuestionWithParameters; recordClass: RecordClass }> {
  return wdkService
    .findQuestion(questionName)
    .then((q: Question) => wdkService.getQuestionAndParameters(q.urlSegment))
    .then((question: QuestionWithParameters) =>
      wdkService
        .findRecordClass(question.recordClassName)
        .then((recordClass: RecordClass) => ({ question, recordClass }))
    );
}

export const loadGroupCounts =
  (groups: any) =>
  (dispatch: any, { wdkService }: any) => {
    // map groups to answerSpec and get counts
  };

export const updateParamValue =
  (
    questionName: string,
    paramName: string,
    paramValue: string,
    contextParamValues: ParamValues
  ) =>
  (dispatch: any, { wdkService }: any) => {
    dispatch({
      type: PARAM_VALUE_UPDATED,
      payload: { questionName, paramName, paramValue, contextParamValues },
    });
    dispatch({
      type: DEPENDENT_PARAMS_LOADING,
      payload: { questionName, paramName, paramValue, contextParamValues },
    });
    wdkService
      .getQuestionParamValues(
        questionName,
        paramName,
        paramValue,
        contextParamValues
      )
      .then(
        (updatedParameters: Parameter[]) => {
          dispatch({
            type: DEPENDENT_PARAMS_LOADED,
            payload: {
              questionName,
              paramName,
              paramValue,
              updatedParameters,
              contextParamValues,
            },
          });
        },
        (error: Error) => {
          dispatch({
            type: DEPENDENT_PARAMS_ERROR,
            payload: { questionName, message: error.message },
          });
        }
      );
  };

export const wrappedUpdateParmValue = interceptDispatch(
  updateParamValue,
  (action: any) => {
    // This function is an action creator, and is called when `updateParamValue`
    // is called via `dispatchAction`. It is the responsibility of this function
    // to send `action` to the dispatcher again, either by returning `action` or
    // by returning a function and getting `dispatch` and calling
    // `dispatch(action)`.
    // XXX It's possible this action creator will need more context than what is
    // provided by `action`. How can we handle this? Should it gain access to the
    // store, like redux middleware? Seems like that would introduce too much
    // coupling with the store's state.
    if (action.type === PARAM_VALUE_UPDATED) {
      return (dispatch: any, { wdkService }: any) => {
        dispatch(action);
        const { updatedParameters } = action.payload;
        updatedParameters.forEach((param: Parameter) => {
          // handle update logic
        });
      };
    }
  }
);

// Placeholder for interceptDispatch - this function is referenced but not defined in the original code
function interceptDispatch(actionCreator: any, interceptor: any): any {
  return actionCreator;
}
