import { merge } from 'rxjs';
import { filter, mergeAll, mergeMap } from 'rxjs/operators';

import { WdkStore } from 'wdk-client/Stores';

import { 
  FINISH_SUBMISSION,
  SUBMIT_FORM,
  UPDATE_FIELD, 
  UPDATE_STUDY, 
  UPDATE_LOADING_ERROR, 
  UPDATE_SUBMISSION_ERROR,
  finishSubmission,
  updateField,
  updateLoadingError,
  updateStudy
} from '../action-creators/AccessRequestActionCreators';
import { datasetId, formValues, userId } from '../selectors/AccessRequestSelectors';

const stateShape = {
  study: null,
  loadingError: null,
  submitting: false,
  successfullySubmitted: false,
  alreadyRequested: false,
  submissionError: null,
  formValues: {
    'request_data': '',
    'requester_name': '',
    'requester_email': '',
    'organization': '',
    'purpose': '',
    'research_question': '',
    'analysis_plan': '',
    'dissemination_plan': ''
  }
};

const ALREADY_REQUESTED_STATUS = 409;

export default class AccessRequestStore extends WdkStore {

  getInitialState() {
    return {
      ...super.getInitialState(),
      ...stateShape
    };
  }

  handleAction(state, { type, payload }) {
    switch(type) {
      case UPDATE_STUDY:
        return {
          ...state,
          study: payload.study
        };

      case UPDATE_LOADING_ERROR:
        return {
          ...state,
          loadingError: payload.loadingError
        }

      case UPDATE_SUBMISSION_ERROR:
        return {
          ...state,
          submissionError: payload.submissionError
        };

      case UPDATE_FIELD:
        return {
          ...state,
          formValues: {
            ...state.formValues,
            [payload.key]: payload.value || ''
          }
        }

      case SUBMIT_FORM:
        return {
          ...state,
          submitting: true
        };

      case FINISH_SUBMISSION:
        return {
          ...state,
          submitting: false,
          successfullySubmitted: payload.successfullySubmitted,
          alreadyRequested: payload.alreadyRequested,
          submissionError: payload.submissionError
        }

      default: 
        return state;
    }
  }

  observeActions(actions$, services) {
    const result = merge(
      this.observeStaticDataLoaded(actions$, services),
      this.observeSubmitForm(actions$, services),
    );

    return result;
  }

  observeStaticDataLoaded(action$, services) {
    return action$.pipe(
      filter(({ type }) => type === 'static/all-data-loaded'),
      mergeMap(async ({ payload }) => {
        const onRequestAccessRoute = window.location.pathname.includes('/request-access/');

        if (!onRequestAccessRoute) {
          return [];
        }

        const datasetId = window.location.pathname.replace(/.*\/request-access\//, '');

        if (onRequestAccessRoute &&
          (payload.user.isGuest || payload.user.properties.approvedStudies.includes(datasetId))
        ) {
          window.history.go(-1);
        } else {
          try {
            const study = await fetchStudy(
              datasetId,
              services.wdkService
            );

            const {
              email = '',
              properties: { firstName, middleName, lastName, organization } = 
                { firstName: '', middleName: '', lastName: '', organization: '' }
            } = payload.user;
  
            return [
              updateField('request_date', new Date().toLocaleDateString('en-US')),
              updateField('requester_name', `${firstName} ${middleName} ${lastName}`.replace(/\s+/g, ' ')),
              updateField('requester_email', email),
              updateField('organization', organization),
              updateStudy(study)
            ];
          }
          catch (loadingError) {
            return [
              updateLoadingError(loadingError)
            ];
          }
        }
      }),
      mergeAll()
    );
  }

  observeSubmitForm(action$, services) {
    return action$.pipe(
      filter(({ type }) => type === SUBMIT_FORM),
      mergeMap(async () => {
        const state = services.getState();

        const response = await jsonPutRequest(
          services.wdkService.serviceUrl,
          `/users/${userId(state)}/access-request/${datasetId(state)}`,
          formValues(state)
        );

        if (response.ok) {
          return finishSubmission(true, false, null);
        } else if (response.status === ALREADY_REQUESTED_STATUS) {
          return finishSubmission(false, true, null);
        } else {
          return finishSubmission(false, false, await response.text())
        }
      })
    );
  }

}

const fetchStudy = (datasetId, wdkService) => wdkService.getRecord(
  'DatasetRecordClasses.DatasetRecordClass',
  [
    {
      name: 'dataset_id',
      value: datasetId
    }
  ],
  {
    attributes: [
      'dataset_id',
      'display_name',
      'request_access_fields'
    ],
    tables: []
  }
);

const jsonPutRequest = (serviceUrl, endpoint, body) => fetch(
  `${serviceUrl}${endpoint}`,
  {
    method: 'PUT',
    headers: {
      'credentials': 'include',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  }
);
