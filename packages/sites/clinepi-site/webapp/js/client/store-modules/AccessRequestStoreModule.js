import { of, merge } from 'rxjs';
import { filter, mergeAll, mergeMap, withLatestFrom } from 'rxjs/operators';

import {
  FINISH_SUBMISSION,
  LOAD_STUDY,
  SUBMIT_FORM,
  UPDATE_FIELD,
  UPDATE_STUDY,
  UPDATE_LOADING_ERROR,
  UPDATE_SUBMISSION_ERROR,
  UPDATE_USER_ID,
  UPDATE_REQUEST_STATUS,
  finishSubmission,
  updateField,
  updateLoadingError,
  updateStudy,
  updateUserId,
  updateRequestStatus,
  UPDATE_EDITABLE_STATUS,
  updateEditableStatus,
} from '../action-creators/AccessRequestActionCreators';
import {
  datasetId,
  formValues,
  requestStatus,
  userId,
} from '../selectors/AccessRequestSelectors';
import { parse } from 'querystring';
import { userUpdate } from '@veupathdb/wdk-client/lib/Actions/UserActions';

import {
  checkPermissions,
  isUserFullyApprovedForStudy,
} from '@veupathdb/study-data-access/lib/study-access/permission';

export const key = 'accessRequest';

const initialState = {
  userId: null,
  study: null,
  loadingError: null,
  submitting: false,
  successfullySubmitted: false,
  alreadyRequested: false,
  submissionError: null,
  formValues: {
    request_date: '',
    requester_name: '',
    requester_email: '',
    organization: '',
    purpose: '',
    prior_auth: '',
    research_question: '',
    analysis_plan: '',
    dissemination_plan: '',
  },
  requestStatus: '',
  allowEdit: true,
};

const ALREADY_REQUESTED_STATUS = 409;

export function reduce(state = initialState, { type, payload }) {
  switch (type) {
    case UPDATE_USER_ID:
      return {
        ...state,
        userId: payload.userId,
      };

    case UPDATE_REQUEST_STATUS:
      return {
        ...state,
        requestStatus: payload.status,
      };

    case UPDATE_EDITABLE_STATUS:
      return {
        ...state,
        allowEdit: payload.status,
      };

    case UPDATE_STUDY:
      return {
        ...state,
        study: payload.study,
      };

    case UPDATE_LOADING_ERROR:
      return {
        ...state,
        loadingError: payload.loadingError,
      };

    case UPDATE_SUBMISSION_ERROR:
      return {
        ...state,
        submissionError: payload.submissionError,
      };

    case UPDATE_FIELD:
      return {
        ...state,
        formValues: {
          ...state.formValues,
          [payload.key]: payload.value || '',
        },
      };

    case SUBMIT_FORM:
      return {
        ...state,
        submitting: true,
      };

    case FINISH_SUBMISSION:
      return {
        ...state,
        submitting: false,
        successfullySubmitted: payload.successfullySubmitted,
        alreadyRequested: payload.alreadyRequested,
        submissionError: payload.submissionError,
      };

    default:
      return state;
  }
}

export function observe(action$, state$, dependencies) {
  return merge(
    observeLoadStudy(action$, state$, dependencies),
    observeSubmitForm(action$, state$, dependencies)
  );
}

function observeLoadStudy(action$, state$, dependencies) {
  return action$.pipe(
    filter(({ type }) => type === LOAD_STUDY),
    mergeMap(async ({ payload: { datasetId } }) => {
      const user = await dependencies.wdkService.getCurrentUser();
      const permissions = await checkPermissions(
        user,
        dependencies.studyAccessApi
      );

      if (user.isGuest || isUserFullyApprovedForStudy(permissions, datasetId)) {
        const { redirectUrl = '/' } = parse(window.location.search.slice(1));

        window.location.assign(decodeURIComponent(redirectUrl));
        return [];
      } else {
        try {
          const study = await fetchStudy(datasetId, dependencies.wdkService);

          const {
            id,
            email = '',
            properties: { firstName, middleName, lastName, organization } = {
              firstName: '',
              middleName: '',
              lastName: '',
              organization: '',
            },
          } = user;

          /**
           * Let's see if a user has already made an access request. If so, let's pre-populate the text fields
           * with the access request's data. If not, let's ensure we start with empty text fields (see below).
           */
          const studyAccessRequestData = await getStudyAccessRequestData(
            dependencies.studyAccessApi,
            user.id,
            datasetId
          );

          return [
            updateUserId(id),
            updateField('request_date', new Date().toLocaleDateString('en-US')),
            updateField(
              'requester_name',
              `${firstName} ${middleName} ${lastName}`.replace(/\s+/g, ' ')
            ),
            updateField('requester_email', email),
            updateField('organization', organization),
            ...(studyAccessRequestData
              ? [
                  updateField('purpose', studyAccessRequestData['purpose']),
                  updateField(
                    'prior_auth',
                    studyAccessRequestData['priorAuth']
                  ),
                  updateField(
                    'research_question',
                    studyAccessRequestData['researchQuestion']
                  ),
                  updateField(
                    'analysis_plan',
                    studyAccessRequestData['analysisPlan']
                  ),
                  updateField(
                    'dissemination_plan',
                    studyAccessRequestData['disseminationPlan']
                  ),
                  updateRequestStatus(studyAccessRequestData['approvalStatus']),
                  updateEditableStatus(studyAccessRequestData['allowEdit']),
                ]
              : [
                  updateField('purpose', ''),
                  updateField('prior_auth', ''),
                  updateField('research_question', ''),
                  updateField('analysis_plan', ''),
                  updateField('dissemination_plan', ''),
                  updateRequestStatus(''),
                  updateEditableStatus(true),
                ]),
            updateStudy(study),
            // reset these values when page loads to avoid getting "stuck" on the
            // "Your data access request has been submitted." screen
            finishSubmission(false, false, null),
          ];
        } catch (loadingError) {
          return [updateLoadingError(loadingError)];
        }
      }
    }),
    mergeAll()
  );
}

function observeSubmitForm(action$, state$, dependencies) {
  return action$.pipe(
    filter(({ type }) => type === SUBMIT_FORM),
    withLatestFrom(state$),
    mergeMap(async ([, { [key]: accessRequestState }]) => {
      if (requestStatus(accessRequestState) === 'denied') {
        const {
          purpose,
          prior_auth,
          research_question,
          analysis_plan,
          dissemination_plan,
        } = formValues(accessRequestState);
        const patchRequestBody = [
          { op: 'replace', path: '/purpose', value: purpose },
          { op: 'replace', path: '/priorAuth', value: prior_auth },
          {
            op: 'replace',
            path: '/researchQuestion',
            value: research_question,
          },
          { op: 'replace', path: '/analysisPlan', value: analysis_plan },
          {
            op: 'replace',
            path: '/disseminationPlan',
            value: dissemination_plan,
          },
        ];
        await dependencies.studyAccessApi.updateEndUserEntry(
          userId(accessRequestState),
          datasetId(accessRequestState),
          patchRequestBody
        );
        const user = await dependencies.wdkService.getCurrentUser({
          force: true,
        });
        return of(userUpdate(user), finishSubmission(true, false, null));
      } else {
        const response = await jsonPutRequest(
          dependencies.wdkService.serviceUrl,
          `/users/${userId(accessRequestState)}/access-request/${datasetId(
            accessRequestState
          )}`,
          formValues(accessRequestState)
        );

        if (response.ok) {
          const user = await dependencies.wdkService.getCurrentUser({
            force: true,
          });
          return of(userUpdate(user), finishSubmission(true, false, null));
        } else if (response.status === ALREADY_REQUESTED_STATUS) {
          return of(finishSubmission(false, true, null));
        } else {
          return of(finishSubmission(false, false, await response.text()));
        }
      }
    }),
    mergeAll()
  );
}

const fetchStudy = (datasetId, wdkService) =>
  wdkService.getRecord(
    'dataset',
    [
      {
        name: 'dataset_id',
        value: datasetId,
      },
    ],
    {
      attributes: [
        'dataset_id',
        'display_name',
        'request_access_fields',
        'request_needs_approval',
        'bulk_download_url',
      ],
      tables: [],
    }
  );

const jsonPutRequest = (serviceUrl, endpoint, body) =>
  fetch(`${serviceUrl}${endpoint}`, {
    method: 'PUT',
    headers: {
      credentials: 'include',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

async function getStudyAccessRequestData(studyAccessApi, userId, datasetId) {
  try {
    const response = await studyAccessApi.fetchEndUserEntry(userId, datasetId);
    return response ?? null;
  } catch (error) {
    // The endpoint returns a 404 if the user has not already submitted
    // a request, so a 404 is expected behavior. Any other error is not.
    if (!error.message.startsWith('404 Not Found')) throw error;
  }
}
