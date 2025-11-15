import React, { Fragment } from 'react';
import ContactUsSubmissionHeader from './ContactUsSubmissionHeader';
import ContactUsPreamble from './ContactUsPreamble';
import ContactUsForm from './ContactUsForm';
import SupportFormBody from '../SupportForm/SupportFormBody';

import type { ValidatedAttachmentMetadata } from '../../selectors/ContactUsSelectors';

interface Props {
  submitDisabled: boolean;
  submissionFailed: boolean;
  responseMessage: string;
  subjectValue: string;
  reporterEmailValue: string;
  ccEmailsValue: string;
  messageValue: string;
  updateSubject: (event: React.ChangeEvent<HTMLInputElement>) => void;
  updateReporterEmail: (event: React.ChangeEvent<HTMLInputElement>) => void;
  updateCcEmails: (event: React.ChangeEvent<HTMLInputElement>) => void;
  updateMessage: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  changeFile: (index: number, files: FileList | null) => void;
  addFile: () => void;
  removeFile: (index: number) => void;
  addScreenshot: (file: File) => void;
  removeScreenshot: (index: number) => void;
  reporterEmailValidity: string;
  ccEmailsValidity: string;
  messageValidity: string;
  validatedAttachmentMetadata: ValidatedAttachmentMetadata[];
  screenshotMetadata: { id: number; file: File }[];
  submitDetails: () => void;
  specialInstructions?: React.ReactNode;
}

const ContactUsSubmission: React.FC<Props> = ({
  submitDisabled,
  submissionFailed,
  responseMessage,
  subjectValue,
  reporterEmailValue,
  ccEmailsValue,
  messageValue,
  updateSubject,
  updateReporterEmail,
  updateCcEmails,
  updateMessage,
  changeFile,
  addFile,
  removeFile,
  addScreenshot,
  removeScreenshot,
  reporterEmailValidity,
  ccEmailsValidity,
  messageValidity,
  validatedAttachmentMetadata,
  screenshotMetadata,
  submitDetails,
  specialInstructions,
}) => (
  <Fragment>
    <ContactUsSubmissionHeader />
    {specialInstructions}
    <SupportFormBody>
      <ContactUsPreamble />
      <ContactUsForm
        submitDisabled={submitDisabled}
        submissionFailed={submissionFailed}
        responseMessage={responseMessage}
        subjectValue={subjectValue}
        reporterEmailValue={reporterEmailValue}
        ccEmailsValue={ccEmailsValue}
        messageValue={messageValue}
        updateSubject={updateSubject}
        updateReporterEmail={updateReporterEmail}
        updateCcEmails={updateCcEmails}
        updateMessage={updateMessage}
        changeFile={changeFile}
        addFile={addFile}
        removeFile={removeFile}
        addScreenshot={addScreenshot}
        removeScreenshot={removeScreenshot}
        reporterEmailValidity={reporterEmailValidity}
        ccEmailsValidity={ccEmailsValidity}
        messageValidity={messageValidity}
        validatedAttachmentMetadata={validatedAttachmentMetadata}
        screenshotMetadata={screenshotMetadata}
        submitDetails={submitDetails}
      />
    </SupportFormBody>
  </Fragment>
);

export default ContactUsSubmission;
