import React from 'react';
import ContactUsAttachments from './ContactUsAttachments';
import ContactUsFooter from './ContactUsFooter';
import ContactUsScreenshots from './ContactUsScreenshots';
import SupportFormField from '../SupportForm/SupportFormField';
import ValidatedInput from '../ValidatedInput';
import ValidatedTextArea from '../ValidatedTextArea';

const ContactUsForm = ({
  submitDisabled,
  submissionFailed,
  responseMessage,
  subjectValue,
  reporterEmailValue,
  ccEmailsValue,
  messageValue,
  reporterEmailValidity,
  ccEmailsValidity,
  messageValidity,
  validatedAttachmentMetadata,
  screenshotMetadata,
  updateSubject,
  updateReporterEmail,
  updateCcEmails,
  updateMessage,
  changeFile,
  addFile,
  removeFile,
  addScreenshot,
  removeScreenshot,
  submitDetails
}) => (
  <form onSubmit={event => {
    event.preventDefault();
    submitDetails();
  }}>
    <table>
      <tbody>
          <SupportFormField
            label="Subject:"
            inputElement={
              <ValidatedInput
                type="text"
                value={subjectValue}
                onChange={updateSubject} 
                size={82}
              />
            }
          />
          <SupportFormField
            label="Your email address:"
            inputElement={
              <ValidatedInput
                type="text"
                value={reporterEmailValue}
                validity={reporterEmailValidity}
                onChange={updateReporterEmail} 
                size={82}
              />
            }
          />
          <SupportFormField
            label="Cc addresses:"
            inputElement={
              <ValidatedInput
                type="text"
                value={ccEmailsValue}
                validity={ccEmailsValidity}
                onChange={updateCcEmails} 
                size={82}
              />
            }
          />
          <SupportFormField
            label="Screenshots:"
            inputElement={
              <ContactUsScreenshots
                addScreenshot={addScreenshot}
                removeScreenshot={removeScreenshot}
                screenshotMetadata={screenshotMetadata}
              />
            }
          />
          <SupportFormField
            label="Attachments:"
            inputElement={
              <ContactUsAttachments
                changeFile={changeFile}
                addFile={addFile}
                removeFile={removeFile}
                validatedAttachmentMetadata={validatedAttachmentMetadata}
              />
            }
          />
          <SupportFormField
            label="Message:"
            inputElement={
              <ValidatedTextArea
                value={messageValue}
                validity={messageValidity}
                onChange={updateMessage} 
                rows={8} 
                cols={80}
            />
            }
          />
          <ContactUsFooter
            submitDisabled={submitDisabled}
            submissionFailed={submissionFailed}
            responseMessage={responseMessage}
            reporterEmailValue={reporterEmailValue}
          />
      </tbody>
    </table>
  </form>
);

export default ContactUsForm;
