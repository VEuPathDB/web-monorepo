import { compose, map } from 'lodash/fp';

import { merge, Observable } from 'rxjs';
import { filter, mergeAll, mergeMap, withLatestFrom } from 'rxjs/operators';

import { EpicDependencies } from '@veupathdb/wdk-client/lib/Core/Store';

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
  CHANGE_CONTEXT,
} from '../actioncreators/ContactUsActionCreators';

import { files, parsedFormFields } from '../selectors/ContactUsSelectors';

export const key = 'contactUs';

const CONTACT_US_ENDPOINT = '/contact-us';

export const SUBMISSION_PENDING = 'SUBMISSION_PENDING';
export const SUBMISSION_SUCCESSFUL = 'SUBMISSION_SUCCESSFUL';
export const SUBMISSION_FAILED = 'SUBMISSION_FAILED';

// Type definitions for attachment/screenshot metadata
export interface AttachmentMetadata {
  id: number;
  file?: File;
  description?: string;
  validity?: string;
}

export interface ScreenshotMetadata {
  id: number;
  file?: File;
  description?: string;
}

// State interface
export interface ContactUsState {
  subject: string;
  reporterEmail: string;
  ccEmails: string;
  message: string;
  context: string;
  attachmentMetadata: AttachmentMetadata[];
  screenshotMetadata: ScreenshotMetadata[];
  submittingStatus: boolean;
  submissionStatus: string;
  responseMessage: string;
  nextAttachmentId: number;
  nextScreenshotId: number;
}

// Action type definitions
interface ChangeSubjectAction {
  type: typeof CHANGE_SUBJECT;
  payload: {
    subject: string;
  };
}

interface ChangeReporterEmailAction {
  type: typeof CHANGE_REPORTER_EMAIL;
  payload: {
    reporterEmail: string;
  };
}

interface ChangeCcEmailsAction {
  type: typeof CHANGE_CC_EMAILS;
  payload: {
    ccEmails: string;
  };
}

interface ChangeMessageAction {
  type: typeof CHANGE_MESSAGE;
  payload: {
    message: string;
  };
}

interface ChangeContextAction {
  type: typeof CHANGE_CONTEXT;
  payload: {
    context: string;
  };
}

interface ChangeAttachmentMetadataAction {
  type: typeof CHANGE_ATTACHMENT_METADATA;
  payload: {
    index: number;
    metadata: Partial<AttachmentMetadata>;
  };
}

interface AddAttachmentMetadataAction {
  type: typeof ADD_ATTACHMENT_METADATA;
  payload: {
    metadata: Partial<AttachmentMetadata>;
  };
}

interface RemoveAttachmentMetadataAction {
  type: typeof REMOVE_ATTACHMENT_METADATA;
  payload: {
    index: number;
  };
}

interface AddScreenshotMetadataAction {
  type: typeof ADD_SCREENSHOT_METADATA;
  payload: {
    metadata: Partial<ScreenshotMetadata>;
  };
}

interface RemoveScreenshotMetadataAction {
  type: typeof REMOVE_SCREENSHOT_METADATA;
  payload: {
    index: number;
  };
}

interface SubmitDetailsAction {
  type: typeof SUBMIT_DETAILS;
  payload: Record<string, never>;
}

interface FinishRequestAction {
  type: typeof FINISH_REQUEST;
  payload: {
    message: string;
    ok: boolean;
  };
}

interface UpdateSubmittingStatusAction {
  type: typeof UPDATE_SUBMITTING_STATUS;
  payload: {
    submittingStatus: boolean;
  };
}

type ContactUsAction =
  | ChangeSubjectAction
  | ChangeReporterEmailAction
  | ChangeCcEmailsAction
  | ChangeMessageAction
  | ChangeContextAction
  | ChangeAttachmentMetadataAction
  | AddAttachmentMetadataAction
  | RemoveAttachmentMetadataAction
  | AddScreenshotMetadataAction
  | RemoveScreenshotMetadataAction
  | SubmitDetailsAction
  | FinishRequestAction
  | UpdateSubmittingStatusAction;

const initialState: ContactUsState = {
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
  nextScreenshotId: 0,
};

export function reduce(
  state: ContactUsState = initialState,
  action: ContactUsAction
): ContactUsState {
  switch (action.type) {
    case CHANGE_SUBJECT:
      return {
        ...state,
        subject: action.payload.subject,
      };

    case CHANGE_REPORTER_EMAIL:
      return {
        ...state,
        reporterEmail: action.payload.reporterEmail,
      };

    case CHANGE_CC_EMAILS:
      return {
        ...state,
        ccEmails: action.payload.ccEmails,
      };

    case CHANGE_MESSAGE:
      return {
        ...state,
        message: action.payload.message,
      };

    case CHANGE_CONTEXT:
      return {
        ...state,
        context: action.payload.context,
      };

    case CHANGE_ATTACHMENT_METADATA:
      return {
        ...state,
        attachmentMetadata: [
          ...state.attachmentMetadata.slice(0, action.payload.index),
          {
            ...state.attachmentMetadata[action.payload.index],
            ...action.payload.metadata,
          },
          ...state.attachmentMetadata.slice(action.payload.index + 1),
        ],
      };

    case ADD_ATTACHMENT_METADATA:
      return {
        ...state,
        attachmentMetadata: [
          ...state.attachmentMetadata,
          {
            ...action.payload.metadata,
            id: state.nextAttachmentId,
          } as AttachmentMetadata,
        ],
        nextAttachmentId: state.nextAttachmentId + 1,
      };

    case REMOVE_ATTACHMENT_METADATA:
      return {
        ...state,
        attachmentMetadata: [
          ...state.attachmentMetadata.slice(0, action.payload.index),
          ...state.attachmentMetadata.slice(action.payload.index + 1),
        ],
      };

    case ADD_SCREENSHOT_METADATA:
      return {
        ...state,
        screenshotMetadata: [
          ...state.screenshotMetadata,
          {
            ...action.payload.metadata,
            id: state.nextScreenshotId,
          } as ScreenshotMetadata,
        ],
        nextScreenshotId: state.nextScreenshotId + 1,
      };

    case REMOVE_SCREENSHOT_METADATA:
      return {
        ...state,
        screenshotMetadata: [
          ...state.screenshotMetadata.slice(0, action.payload.index),
          ...state.screenshotMetadata.slice(action.payload.index + 1),
        ],
      };

    case SUBMIT_DETAILS:
      return {
        ...state,
        submittingStatus: true,
      };

    case FINISH_REQUEST:
      return {
        ...state,
        submissionStatus: action.payload.ok
          ? SUBMISSION_SUCCESSFUL
          : SUBMISSION_FAILED,
        responseMessage: action.payload.message,
      };

    case UPDATE_SUBMITTING_STATUS:
      return {
        ...state,
        submittingStatus: action.payload.submittingStatus,
      };

    default:
      return state;
  }
}

// Define user loaded action interface
interface UserLoadedAction {
  type: 'static/user-loaded';
  payload: {
    user: {
      email: string;
      isGuest: boolean;
    };
  };
}

// Type for the combined actions in the epic
type EpicAction = ContactUsAction | UserLoadedAction | ReturnType<typeof updateField> | ReturnType<typeof updateSubmittingStatus> | ReturnType<typeof finishRequest>;

// Type for state with contactUs module
interface StateWithContactUs {
  [key]: ContactUsState;
}

export function observe(
  action$: Observable<EpicAction>,
  state$: Observable<StateWithContactUs>,
  dependencies: EpicDependencies
): Observable<EpicAction> {
  return merge(
    observeSubmitDetails(action$, state$, dependencies),
    observeUserLoaded(action$, state$, dependencies)
  );
}

const observeSubmitDetails = (
  action$: Observable<EpicAction>,
  state$: Observable<StateWithContactUs>,
  { wdkService }: EpicDependencies
): Observable<EpicAction> =>
  action$.pipe(
    filter((action): action is SubmitDetailsAction => action.type === SUBMIT_DETAILS),
    withLatestFrom(state$),
    mergeMap(async ([, state]) => {
      const contactUsState = state[key];
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
          attachmentIds,
        }
      );

      return [
        finishRequest(await response.text(), response.ok),
        updateSubmittingStatus(false),
      ];
    }),
    mergeAll()
  );

const observeUserLoaded = (
  action$: Observable<EpicAction>,
  state$: Observable<StateWithContactUs>,
  dependencies: EpicDependencies
): Observable<EpicAction> =>
  action$.pipe(
    filter((action): action is UserLoadedAction => action.type === 'static/user-loaded'),
    mergeMap(
      ({
        payload: {
          user: { email, isGuest },
        },
      }) => (isGuest ? [] : [updateField('reporterEmail')(email)])
    )
  );

const jsonPostRequest = (
  serviceUrl: string,
  endpoint: string,
  body: unknown
): Promise<Response> =>
  fetch(`${serviceUrl}${endpoint}`, {
    method: 'POST',
    headers: {
      credentials: 'include',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
