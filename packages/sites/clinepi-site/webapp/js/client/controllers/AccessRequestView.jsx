import React, { Component, Fragment } from 'react';

import { Link } from '@veupathdb/wdk-client/lib/Components';

import SupportFormBase from '@veupathdb/web-common/lib/components/SupportForm/SupportFormBase';
import SupportFormBody from '@veupathdb/web-common/lib/components/SupportForm/SupportFormBody';

class AccessRequestView extends Component {
  constructor(...args) {
    super(...args);

    this.renderTitle = this.renderTitle.bind(this);
    this.renderContent = this.renderContent.bind(this);
    this.renderAccessRequestForm = this.renderAccessRequestForm.bind(this);
  }

  renderTitle() {
    const { formTitle, successfullySubmitted, requestStatus } = this.props;

    if (successfullySubmitted) {
      return <h1>Data Access Request Submitted</h1>;
    } else if (requestStatus === 'denied') {
      return <h1>Re-Submit Data Access Request</h1>;
    } else if (requestStatus === 'requested') {
      return <h1>Data Access Request Already Submitted</h1>;
    } else {
      return <h1>{formTitle}</h1>;
    }
  }

  renderContent() {
    const AccessRequestForm = this.renderAccessRequestForm;
    const {
      successfullySubmitted,
      requestNeedsApproval,
      datasetId,
      webAppUrl,
      requestStatus,
      denialReason,
    } = this.props;
    const studyPageUrl = webAppUrl + '/app/record/dataset/' + datasetId;

    if (successfullySubmitted && requestNeedsApproval != '0') {
      return (
        <Fragment>
          <p>
            Your data access request has been submitted. We will contact you if
            any additional information is needed. Please{' '}
            <a href={`${webAppUrl}/app/contact-us`} target="_blank">
              contact us
            </a>{' '}
            with any questions.
          </p>
        </Fragment>
      );
    } else if (successfullySubmitted && requestNeedsApproval == '0') {
      return (
        <Fragment>
          <p>
            Thank you for submitting your data access registration. You may go
            to the <a href={`${studyPageUrl}`}>study page</a> to download the
            data files.
          </p>
        </Fragment>
      );
    } else if (requestStatus === 'denied') {
      const denialReasonDetails = denialReason.split('.');
      return (
        <Fragment>
          <p>
            Your data access request has been denied with the following details:
            <ul className="access-request-denial-ul">
              <li>{denialReasonDetails[0].trim()}</li>
              <li>{denialReasonDetails[1].trim()}</li>
            </ul>
            You may edit and re-submit your request. Please{' '}
            <a href={`${webAppUrl}/app/contact-us`} target="_blank">
              contact us
            </a>{' '}
            with any questions.
          </p>
          <AccessRequestForm />
        </Fragment>
      );
    } else if (requestStatus === 'requested') {
      return (
        <Fragment>
          <p>
            Our records indicate that you have already submitted a request for
            this dataset. If you have any questions about the status of your
            request, please don't hesitate to{' '}
            <a href={`${webAppUrl}/app/contact-us`} target="_blank">
              contact us
            </a>
            .
          </p>
          <AccessRequestForm />
        </Fragment>
      );
    } else {
      return <AccessRequestForm />;
    }
  }

  renderAccessRequestForm() {
    const {
      disableSubmit,
      fieldElements,
      formValues,
      submitForm,
      submissionError,
      webAppUrl,
      allowEdit,
      datasetId,
    } = this.props;

    return (
      <Fragment>
        <h4 className="access-request-form-header">
          Data files will be available to download in a tab-delimited format
          with an additional data dictionary file. To process your download
          request, the data providers for this study require documentation of
          the following information.
          <br />
          <br />
          To ensure transparency and promote collaboration within the wider
          scientific community, your name, organization, date of request and
          purpose for which the data will be used, as submitted below, will
          appear publicly on the corresponding{' '}
          <a
            href={`${webAppUrl}/app/record/dataset/${datasetId}#AccessRequest`}
          >
            study page
          </a>{' '}
          after a request has been granted. The dataset page also contains
          critical methodologic information and study findings that are
          necessary to interpret the requested study data.
          <br />
          <br />
          If you have any questions about a data access request please contact
          us at <a href={`${webAppUrl}/app/contact-us`}>help@clinepidb.org</a>.
        </h4>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitForm();
          }}
        >
          <table align="left">
            <tbody>
              {fieldElements.map(
                ({ key, FieldComponent, label, onChangeKey }) => (
                  <FieldComponent
                    key={key}
                    mykey={key}
                    label={label}
                    value={formValues[key]}
                    onChange={this.props[onChangeKey]}
                    disabled={!allowEdit}
                  />
                )
              )}
              <tr>
                <td colSpan={4}>
                  <div>
                    <em>
                      Note: if there is a discrepancy with your personal
                      information, please{' '}
                      <Link to="/user/profile">update your profile</Link>.
                    </em>
                  </div>
                </td>
              </tr>
              <tr>
                <td colSpan={4}>
                  <input
                    type="submit"
                    disabled={disableSubmit || !allowEdit}
                    value="Submit"
                  />
                </td>
              </tr>
              {submissionError && (
                <tr>
                  <td colSpan={4}>
                    The following error was reported when we tried to submit
                    your request. If it persists, please don't hesitate to{' '}
                    <a href={`${webAppUrl}/app/contact-us`} target="_blank">
                      contact us
                    </a>{' '}
                    for help:
                    <p>{submissionError}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </form>
      </Fragment>
    );
  }

  render() {
    const Title = this.renderTitle;
    const Content = this.renderContent;

    return (
      <SupportFormBase>
        <SupportFormBody>
          <Title />
          <Content />
        </SupportFormBody>
      </SupportFormBase>
    );
  }
}

export default AccessRequestView;
