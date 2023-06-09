export const LOAD_STUDY = 'request-access/load-study';
export const UPDATE_USER_ID = 'request-access/update-user-id';
export const UPDATE_STUDY = 'request-access/update-study';
export const UPDATE_LOADING_ERROR = 'request-access/update-loading-error';
export const UPDATE_SUBMISSION_ERROR = 'request-access/update-submission-error';
export const UPDATE_FIELD = 'request-access/update-field';
export const SUBMIT_FORM = 'request-access/submit-form';
export const FINISH_SUBMISSION = 'request-access/finish-submission';
export const UPDATE_REQUEST_STATUS = 'request-access/update-request-status';
export const UPDATE_EDITABLE_STATUS = 'request-access/update-editable-status';
export const UPDATE_DENIAL_REASON = 'request-access/update-denial-reason';

export const loadStudy = (datasetId) => ({
  type: LOAD_STUDY,
  payload: {
    datasetId,
  },
});

export const updateRequestStatus = (status) => ({
  type: UPDATE_REQUEST_STATUS,
  payload: {
    status,
  },
});

export const updateEditableStatus = (status) => ({
  type: UPDATE_EDITABLE_STATUS,
  payload: {
    status,
  },
});

export const updateDenialReason = (reason) => ({
  type: UPDATE_DENIAL_REASON,
  payload: {
    reason,
  },
});

export const updateUserId = (userId) => ({
  type: UPDATE_USER_ID,
  payload: {
    userId,
  },
});

export const updateStudy = (study) => ({
  type: UPDATE_STUDY,
  payload: {
    study,
  },
});

export const updateLoadingError = (loadingError) => ({
  type: UPDATE_LOADING_ERROR,
  payload: {
    loadingError,
  },
});

export const updateSubmissionError = (submissionError) => ({
  type: UPDATE_SUBMISSION_ERROR,
  payload: {
    submissionError,
  },
});

export const updateField = (key, value) => ({
  type: UPDATE_FIELD,
  payload: {
    key,
    value,
  },
});

export const onChangeFieldFactory = (key) => (event) =>
  updateField(key, event.target.value);

export const submitForm = () => ({
  type: SUBMIT_FORM,
  payload: {},
});

export const finishSubmission = (
  successfullySubmitted,
  alreadyRequested,
  submissionError
) => ({
  type: FINISH_SUBMISSION,
  payload: {
    successfullySubmitted,
    alreadyRequested,
    submissionError,
  },
});
