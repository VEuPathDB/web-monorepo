import {
  compose,
  concat,
  filter,
  isEqual,
  length,
  map,
  split,
  trim,
} from 'lodash/fp';
import { createSelector } from 'reselect';

import { EMAIL_REGEX } from '../util/email';

import {
  SUBMISSION_FAILED,
  SUBMISSION_SUCCESSFUL,
  ContactUsState,
  AttachmentMetadata,
} from '../store-modules/ContactUsStoreModule';

export const MAX_ATTACHMENT_SIZE = 5000000;
export const MAX_ATTACHMENT_SIZE_DESCRIPTION = '5Mb';

const propSelectorFactory =
  <K extends keyof ContactUsState>(prop: K) =>
  (state: ContactUsState): ContactUsState[K] =>
    state[prop];

export const submittingStatus = propSelectorFactory('submittingStatus');
export const submissionStatus = propSelectorFactory('submissionStatus');
export const responseMessage = propSelectorFactory('responseMessage');
export const subjectValue = propSelectorFactory('subject');
export const reporterEmailValue = propSelectorFactory('reporterEmail');
export const ccEmailsValue = propSelectorFactory('ccEmails');
export const messageValue = propSelectorFactory('message');
export const contextValue = propSelectorFactory('context');
export const attachmentMetadata = propSelectorFactory('attachmentMetadata');
export const screenshotMetadata = propSelectorFactory('screenshotMetadata');

export const submitDisabled = submittingStatus;

export const submissionFailed = createSelector(
  submissionStatus,
  isEqual(SUBMISSION_FAILED)
);

export const submissionSuccessful = createSelector(
  submissionStatus,
  isEqual(SUBMISSION_SUCCESSFUL)
);

export const reporterEmailValidity = createSelector(
  reporterEmailValue,
  (reporterEmail: string): string =>
    reporterEmail.length > 0 && !EMAIL_REGEX.test(reporterEmail)
      ? 'Please provide a valid email address where we can reach you.'
      : ''
);

export const messageValidity = createSelector(
  messageValue,
  (message: string): string =>
    message.length === 0 ? 'Please provide a message for our team.' : ''
);

export const parsedCcEmails = createSelector(
  ccEmailsValue,
  compose(filter(length), map(trim), split(/[;,]/))
);

export const ccEmailsValidity = createSelector(
  parsedCcEmails,
  (ccEmails: string[]): string => {
    if (ccEmails.length > 10) {
      return 'Please provide at most 10 emails to cc.';
    }

    const invalidEmails = ccEmails.filter(
      (ccEmail) => !EMAIL_REGEX.test(ccEmail)
    );

    return invalidEmails.length
      ? `Please correct the following email address(es): ${invalidEmails.join(
          ', '
        )}.`
      : '';
  }
);

export const files = createSelector(
  attachmentMetadata,
  screenshotMetadata,
  compose(map('file'), concat)
);

// Type for validated attachment metadata
export interface ValidatedAttachmentMetadata extends AttachmentMetadata {
  validity: string;
}

export const validatedAttachmentMetadata = createSelector(
  attachmentMetadata,
  (attachmentMetadata: AttachmentMetadata[]): ValidatedAttachmentMetadata[] =>
    map(validateMetadatum)(attachmentMetadata)
);

const validateMetadatum = (
  metadatum: AttachmentMetadata
): ValidatedAttachmentMetadata => {
  if (!metadatum.file) {
    return addValidityToAttachmentMetadatum(
      metadatum,
      'Please choose a file to upload.'
    );
  } else if (metadatum.file.size > MAX_ATTACHMENT_SIZE) {
    return addValidityToAttachmentMetadatum(
      metadatum,
      `Please choose a file which is under ${MAX_ATTACHMENT_SIZE_DESCRIPTION}.`
    );
  } else {
    return addValidityToAttachmentMetadatum(metadatum, '');
  }
};

const addValidityToAttachmentMetadatum = (
  metadatum: AttachmentMetadata,
  validity: string
): ValidatedAttachmentMetadata => ({
  ...metadatum,
  validity,
});

// Type for parsed form fields
export interface ParsedFormFields {
  subject: string;
  reporterEmail: string;
  ccEmails: string[];
  message: string;
  context: string;
}

export const parsedFormFields = createSelector(
  subjectValue,
  reporterEmailValue,
  parsedCcEmails,
  messageValue,
  contextValue,
  (
    subject: string,
    reporterEmail: string,
    ccEmails: string[],
    message: string,
    context: string
  ): ParsedFormFields => ({
    subject,
    reporterEmail,
    ccEmails,
    message,
    context,
  })
);
