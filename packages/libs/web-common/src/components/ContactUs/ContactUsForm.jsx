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
  submitDetails,
}) => (
  <form
    onSubmit={(event) => {
      event.preventDefault();
      submitDetails();
    }}
  >
    <table
      style={{
        borderCollapse: 'separate',
        borderSpacing: '0 0.5em',
      }}
    >
      <tbody>
        <SupportFormField
          label="Subject:"
          inputElement={
            <ValidatedInput
              type="text"
              value={subjectValue}
              onChange={updateSubject}
              size={80}
            />
          }
        />
        <SupportFormField
          label="Your email address:"
          inputElement={
            <>
              <ValidatedInput
                type="text"
                value={reporterEmailValue}
                validity={reporterEmailValidity}
                onChange={updateReporterEmail}
                size={80}
              />
              <p style={{ margin: '3px 0 0 0', fontSize: '0.85em' }}>
                <em>
                  An email address is required if you would like to hear back
                  from us.
                </em>
              </p>
            </>
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
              size={80}
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
        />
      </tbody>
    </table>
  </form>
);

export default ContactUsForm;
