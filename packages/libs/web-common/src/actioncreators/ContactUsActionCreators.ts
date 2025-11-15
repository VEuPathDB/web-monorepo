export const CHANGE_SUBJECT = 'contact-us/change-subject';
export const CHANGE_REPORTER_EMAIL = 'contact-us/change-email';
export const CHANGE_CC_EMAILS = 'contact-us/change-cc-emails';
export const CHANGE_MESSAGE = 'contact-us/change-message';
export const CHANGE_CONTEXT = 'contact-us/change-context';
export const CHANGE_ATTACHMENT_METADATA =
  'contact-us/change-attachment-metadata';
export const ADD_ATTACHMENT_METADATA = 'contact-us/add-attachment-metadata';
export const REMOVE_ATTACHMENT_METADATA =
  'contact-us/remove-attachment-metadata';
export const ADD_SCREENSHOT_METADATA = 'contact-us/add-screenshot-metadata';
export const REMOVE_SCREENSHOT_METADATA =
  'contact-us/remove-screenshot-metadata';
export const UPDATE_SUBMITTING_STATUS = 'contact-us/update-submitting-status';
export const SUBMIT_DETAILS = 'contact-us/submit-details';
export const FINISH_REQUEST = 'contact-us/finish-request';

// Type definitions for field names
type FieldName = 'subject' | 'reporterEmail' | 'ccEmails' | 'message' | 'context';

const fieldToTypeMap: Record<FieldName, string> = {
  subject: CHANGE_SUBJECT,
  reporterEmail: CHANGE_REPORTER_EMAIL,
  ccEmails: CHANGE_CC_EMAILS,
  message: CHANGE_MESSAGE,
  context: CHANGE_CONTEXT,
};

// Action type interfaces
export interface ChangeSubjectAction {
  type: typeof CHANGE_SUBJECT;
  payload: {
    subject: string;
  };
}

export interface ChangeReporterEmailAction {
  type: typeof CHANGE_REPORTER_EMAIL;
  payload: {
    reporterEmail: string;
  };
}

export interface ChangeCcEmailsAction {
  type: typeof CHANGE_CC_EMAILS;
  payload: {
    ccEmails: string;
  };
}

export interface ChangeMessageAction {
  type: typeof CHANGE_MESSAGE;
  payload: {
    message: string;
  };
}

export interface ChangeContextAction {
  type: typeof CHANGE_CONTEXT;
  payload: {
    context: string;
  };
}

export interface ChangeAttachmentMetadataAction {
  type: typeof CHANGE_ATTACHMENT_METADATA;
  payload: {
    index: number;
    metadata: any;
  };
}

export interface AddAttachmentMetadataAction {
  type: typeof ADD_ATTACHMENT_METADATA;
  payload: {
    metadata: any;
  };
}

export interface RemoveAttachmentMetadataAction {
  type: typeof REMOVE_ATTACHMENT_METADATA;
  payload: {
    index: number;
  };
}

export interface AddScreenshotMetadataAction {
  type: typeof ADD_SCREENSHOT_METADATA;
  payload: {
    metadata: any;
  };
}

export interface RemoveScreenshotMetadataAction {
  type: typeof REMOVE_SCREENSHOT_METADATA;
  payload: {
    index: number;
  };
}

export interface UpdateSubmittingStatusAction {
  type: typeof UPDATE_SUBMITTING_STATUS;
  payload: {
    submittingStatus: string;
  };
}

export interface SubmitDetailsAction {
  type: typeof SUBMIT_DETAILS;
  payload: {};
}

export interface FinishRequestAction {
  type: typeof FINISH_REQUEST;
  payload: {
    message: string;
    ok: boolean;
  };
}

/**
 * Action creator factory for updating a field
 */
export const updateField = (fieldName: FieldName) => (contents: string) => ({
  type: fieldToTypeMap[fieldName],
  payload: {
    [fieldName]: contents,
  },
});

/**
 * Update the metadata for an attachment
 */
export const changeAttachmentMetadata = (
  index: number,
  metadata: any
): ChangeAttachmentMetadataAction => ({
  type: CHANGE_ATTACHMENT_METADATA,
  payload: {
    index,
    metadata,
  },
});

/**
 * Add metadata for an attachment
 */
export const addAttachmentMetadata = (
  metadata: any
): AddAttachmentMetadataAction => ({
  type: ADD_ATTACHMENT_METADATA,
  payload: {
    metadata,
  },
});

/**
 * Remove metadata for an attachment
 */
export const removeAttachmentMetadata = (
  index: number
): RemoveAttachmentMetadataAction => ({
  type: REMOVE_ATTACHMENT_METADATA,
  payload: {
    index,
  },
});

/**
 * Add metadata for a screenshot
 */
export const addScreenshotMetadata = (
  metadata: any
): AddScreenshotMetadataAction => ({
  type: ADD_SCREENSHOT_METADATA,
  payload: {
    metadata,
  },
});

/**
 * Remove metadata for a screenshot
 */
export const removeScreenshotMetadata = (
  index: number
): RemoveScreenshotMetadataAction => ({
  type: REMOVE_SCREENSHOT_METADATA,
  payload: {
    index,
  },
});

/**
 * Update the "submitting" status
 */
export const updateSubmittingStatus = (
  submittingStatus: string
): UpdateSubmittingStatusAction => ({
  type: UPDATE_SUBMITTING_STATUS,
  payload: {
    submittingStatus,
  },
});

/**
 * Submit form details to our dedicated "Contact Us" REST endpoint
 */
export const submitDetails = (): SubmitDetailsAction => ({
  type: SUBMIT_DETAILS,
  payload: {},
});

/**
 * Report the results of the submission process
 */
export const finishRequest = (
  message: string,
  ok: boolean
): FinishRequestAction => ({
  type: FINISH_REQUEST,
  payload: {
    message,
    ok,
  },
});
