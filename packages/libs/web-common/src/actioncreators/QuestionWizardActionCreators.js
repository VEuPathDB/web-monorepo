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

/**
 * Load question resource identified by `questionName`.
 * @param {string} questionName
 */
export const loadQuestion =
  (questionName, paramValues) =>
  (dispatch, { wdkService }) => {
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
      (error) => {
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
 * @param {WdkService} wdkService
 * @param {string} questionName
 */
function fetchQuestionResources(wdkService, questionName) {
  return wdkService
    .findQuestion(questionName)
    .then((q) => getQuestionAndParameters(q.urlSegment))
    .then((question) =>
      wdkService
        .findRecordClass(question.recordClassName)
        .then((recordClass) => ({ question, recordClass }))
    );
}

export const loadGroupCounts =
  (groups) =>
  (dispatch, { wdkService }) => {
    // map groups to answerSpec and get counts
  };

export const updateParamValue =
  (questionName, paramName, paramValue, contextParamValues) =>
  (dispatch, { wdkService }) => {
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
        (updatedParameters) => {
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
        (error) => {
          dispatch({
            type: DEPENDENT_PARAMS_ERROR,
            payload: { questionName, message: error.message },
          });
        }
      );
  };

export const wrappedUpdateParmValue = interceptDispatch(
  updateParamValue,
  (action) => {
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
      return (dispatch, { wdkService }) => {
        dispatch(action);
        const { updatedParameters } = action.payload;
        updatedParameters.forEach((param) => {
          // handle update logic
        });
      };
    }
  }
);
