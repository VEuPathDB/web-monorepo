import React, { Fragment } from 'react';
import ContactUsSubmissionHeader from './ContactUsSubmissionHeader';
import ContactUsPreamble from './ContactUsPreamble';
import ContactUsForm from './ContactUsForm';
import SupportFormBody from '../SupportForm/SupportFormBody';

const ContactUsSubmission = ({
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
  specialInstructions
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
