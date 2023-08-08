import { compose, get } from 'lodash/fp';
import React from 'react';
import { connect } from 'react-redux';

import { PageController } from '@veupathdb/wdk-client/lib/Controllers';
import { wrappable } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

import {
  updateField,
  changeAttachmentMetadata,
  addAttachmentMetadata,
  removeAttachmentMetadata,
  addScreenshotMetadata,
  removeScreenshotMetadata,
  submitDetails,
} from '../actioncreators/ContactUsActionCreators';

import ContactUsFinished from '../components/ContactUs/ContactUsFinished';
import ContactUsSubmission from '../components/ContactUs/ContactUsSubmission';
import SupportFormBase from '../components/SupportForm/SupportFormBase';

import {
  submitDisabled,
  submissionFailed,
  submissionSuccessful,
  responseMessage,
  subjectValue,
  reporterEmailValue,
  ccEmailsValue,
  messageValue,
  messageValidity,
  reporterEmailValidity,
  ccEmailsValidity,
  validatedAttachmentMetadata,
  screenshotMetadata,
} from '../selectors/ContactUsSelectors';

class ContactUsView extends PageController {
  isRenderDataLoaded() {
    const { displayName, user } = this.props.stateProps;

    return displayName && user;
  }

  loadData(prevProps) {
    if (prevProps == null) {
      const { context = '' } = this.props;
      const { updateContext } = this.props.dispatchProps;
      updateContext(context);
    }
  }

  getTitle() {
    const { displayName } = this.props.stateProps;

    return `${displayName} :: Help`;
  }

  renderView() {
    const {
      displayName,
      submitDisabled,
      submissionFailed,
      submissionSuccessful,
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
    } = this.props.stateProps;

    const {
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
    } = this.props.dispatchProps;

    return (
      <SupportFormBase>
        {submissionSuccessful ? (
          <ContactUsFinished
            message={`Your message has been sent to the ${displayName} team.
                  For your records, a copy has been sent to your email.`}
          />
        ) : (
          <ContactUsSubmission
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
            specialInstructions={this.props.specialInstructions}
          />
        )}
      </SupportFormBase>
    );
  }
}

const targetValue = ({ target: { value } }) => value;

const mapStateToProps = ({
  contactUs: contactUsState,
  globalData: globalDataState,
}) => ({
  displayName: get('config.displayName', globalDataState),
  user: get('user', globalDataState),
  submitDisabled: submitDisabled(contactUsState),
  submissionFailed: submissionFailed(contactUsState),
  submissionSuccessful: submissionSuccessful(contactUsState),
  responseMessage: responseMessage(contactUsState),
  subjectValue: subjectValue(contactUsState),
  reporterEmailValue: reporterEmailValue(contactUsState),
  ccEmailsValue: ccEmailsValue(contactUsState),
  messageValue: messageValue(contactUsState),
  reporterEmailValidity: reporterEmailValidity(contactUsState),
  ccEmailsValidity: ccEmailsValidity(contactUsState),
  messageValidity: messageValidity(contactUsState),
  validatedAttachmentMetadata: validatedAttachmentMetadata(contactUsState),
  screenshotMetadata: screenshotMetadata(contactUsState),
});

const mapDispatchToProps = {
  updateSubject: compose(updateField('subject'), targetValue),
  updateReporterEmail: compose(updateField('reporterEmail'), targetValue),
  updateCcEmails: compose(updateField('ccEmails'), targetValue),
  updateMessage: compose(updateField('message'), targetValue),
  updateContext: updateField('context'),
  changeFile: (index, files) => {
    return files.length === 0
      ? changeAttachmentMetadata(index, { file: null })
      : changeAttachmentMetadata(index, { file: files[0] });
  },
  addFile: () => addAttachmentMetadata({}),
  removeFile: (index) => removeAttachmentMetadata(index),
  addScreenshot: (file) => addScreenshotMetadata({ file }),
  removeScreenshot: (index) => removeScreenshotMetadata(index),
  submitDetails,
};

const mergeProps = (stateProps, dispatchProps, ownProps) => ({
  stateProps,
  dispatchProps,
  specialInstructions: ownProps.specialInstructions || null,
  context: ownProps.context || '',
});

const ContactUsController = connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(ContactUsView);

export default wrappable(ContactUsController);
