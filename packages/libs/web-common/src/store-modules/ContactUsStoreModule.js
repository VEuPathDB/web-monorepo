import { 
  compose,
  map 
} from 'lodash/fp';

import { merge } from 'rxjs';
import { 
  filter,
  mergeAll, 
  mergeMap, 
  withLatestFrom 
} from 'rxjs/operators';

import { 
  CHANGE_SUBJECT,
  CHANGE_REPORTER_EMAIL,
  CHANGE_CC_EMAILS,
  CHANGE_MESSAGE,
  CHANGE_ATTACHMENT_METADATA,
  ADD_ATTACHMENT_METADATA,
  REMOVE_ATTACHMENT_METADATA,
  ADD_SCREENSHOT_METADATA,
  REMOVE_SCREENSHOT_METADATA,
  SUBMIT_DETAILS,
  FINISH_REQUEST,
  UPDATE_SUBMITTING_STATUS,
  updateField,
  updateSubmittingStatus,
  finishRequest,
  CHANGE_CONTEXT
} from '../actioncreators/ContactUsActionCreators';

import { files, parsedFormFields } from '../selectors/ContactUsSelectors';

export const key = 'contactUs';

const CONTACT_US_ENDPOINT = '/contact-us';

export const SUBMISSION_PENDING = 'SUBMISSION_PENDING';
export const SUBMISSION_SUCCESSFUL = 'SUBMISSION_SUCCESSFUL';
export const SUBMISSION_FAILED = 'SUBMISSION_FAILED';

const initialState = {
  subject: '',
  reporterEmail: '',
  ccEmails: '',
  message: '',
  context: '',
  attachmentMetadata: [],
  screenshotMetadata: [],
  submittingStatus: false,
  submissionStatus: SUBMISSION_PENDING,
  responseMessage: '',
  nextAttachmentId: 0,
  nextScreenshotId: 0
};

export function reduce(state = initialState, { type, payload }) {
  switch(type) {
    case CHANGE_SUBJECT:
      return {
        ...state,
        subject: payload.subject
      };

    case CHANGE_REPORTER_EMAIL:
      return {
        ...state,
        reporterEmail: payload.reporterEmail
      };

    case CHANGE_CC_EMAILS:
      return {
        ...state,
        ccEmails: payload.ccEmails
      };

    case CHANGE_MESSAGE:
      return {
        ...state,
        message: payload.message
      };

    case CHANGE_CONTEXT:
      return {
        ...state,
        context: payload.context
      }

    case CHANGE_ATTACHMENT_METADATA:
      return {
        ...state,
        attachmentMetadata: [
          ...state.attachmentMetadata.slice(0, payload.index),
          {
            ...state.attachmentMetadata[payload.index],
            ...payload.metadata
          },
          ...state.attachmentMetadata.slice(payload.index + 1)
        ]
      };

    case ADD_ATTACHMENT_METADATA:
      return {
        ...state,
        attachmentMetadata: [
          ...state.attachmentMetadata,
          {
            ...payload.metadata,
            id: state.nextAttachmentId
          }
        ],
        nextAttachmentId: state.nextAttachmentId + 1
      };

    case REMOVE_ATTACHMENT_METADATA:
      return {
        ...state,
        attachmentMetadata: [
          ...state.attachmentMetadata.slice(0, payload.index),
          ...state.attachmentMetadata.slice(payload.index + 1)
        ]
      };

    case ADD_SCREENSHOT_METADATA:
      return {
        ...state,
        screenshotMetadata: [
          ...state.screenshotMetadata,
          {
            ...payload.metadata,
            id: state.nextScreenshotId
          }
        ],
        nextScreenshotId: state.nextScreenshotId + 1
      };

    case REMOVE_SCREENSHOT_METADATA:
      return {
        ...state,
        screenshotMetadata: [
          ...state.screenshotMetadata.slice(0, payload.index),
          ...state.screenshotMetadata.slice(payload.index + 1)
        ]
      };

    case SUBMIT_DETAILS:
      return {
        ...state,
        submittingStatus: true
      };

    case FINISH_REQUEST:
      return {
        ...state,
        submissionStatus: payload.ok 
          ? SUBMISSION_SUCCESSFUL 
          : SUBMISSION_FAILED,
        responseMessage: payload.message
      };

    case UPDATE_SUBMITTING_STATUS:
      return {
        ...state,
        submittingStatus: payload.submittingStatus
      };

    default: 
      return state;
  }
}

export function observe(action$, state$, dependencies) {
  return merge(
    observeSubmitDetails(action$, state$, dependencies),
    observeUserLoaded(action$, state$, dependencies)
  );
}

const observeSubmitDetails = (
  action$, 
  state$, 
  { 
    wdkService
  }
) =>
  action$.pipe(
    filter(({ type }) => type === SUBMIT_DETAILS),
    withLatestFrom(state$),
    mergeMap(async ([ , { [key]: contactUsState }]) => {
      const temporaryFilePromises = compose(
        map(wdkService.createTemporaryFile.bind(wdkService)),
        files
      )(contactUsState);

      const attachmentIds = await Promise.all(temporaryFilePromises);

      // FIXME: This should be spun off into a WdkService mixin
      const response = await jsonPostRequest(
        wdkService.serviceUrl,
        CONTACT_US_ENDPOINT,
        {
          ...parsedFormFields(contactUsState),
          // referrer: (window.opener && window.opener.location.href) || undefined,
          attachmentIds
        }
      );

      return [
        finishRequest(await response.text(), response.ok),
        updateSubmittingStatus(false)
      ]
    }),
    mergeAll()
  );

const observeUserLoaded = (action$, state$, dependencies) => 
  action$.pipe(
    filter(({ type }) => type === 'static/user-loaded'),
    mergeMap(({ payload: { user: { email, isGuest } } }) =>
      isGuest 
        ? []
        : [updateField('reporterEmail')(email)]
    )
  );

const jsonPostRequest = (serviceUrl, endpoint, body) => fetch(
  `${serviceUrl}${endpoint}`,
  {
    method: 'POST',
    headers: {
      'credentials': 'include',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  }
);
