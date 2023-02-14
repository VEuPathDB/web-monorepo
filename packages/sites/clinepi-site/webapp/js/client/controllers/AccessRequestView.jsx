import React, { Component, Fragment, useEffect, useState } from 'react';

import { Link } from '@veupathdb/wdk-client/lib/Components';

import SupportFormBase from '@veupathdb/web-common/lib/components/SupportForm/SupportFormBase';
import SupportFormBody from '@veupathdb/web-common/lib/components/SupportForm/SupportFormBody';

import { useWdkService } from '@veupathdb/wdk-client/lib/Hooks/WdkServiceHook';
import { useStudyAccessApi } from '@veupathdb/study-data-access/lib/study-access/studyAccessHooks';

const camelToSnakeCase = (str) =>
  str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

const AccessRequestView = (props) => {
  const [existingRequestData, setExistingRequestData] = useState(null);
  const user = useWdkService((wdkService) => wdkService.getCurrentUser(), []);
  const studyAccessApi = useStudyAccessApi();

  useEffect(() => {
    const asyncFunction = async () => {
      const indexOfFirst =
        props.location.pathname.toString().indexOf("/DS_") + 1;
      const datasetId = props.location.pathname.toString().slice(indexOfFirst);
      let response = null;

      try {
        response =
          datasetId && user
            ? await studyAccessApi.fetchEndUserEntry(user.id, datasetId)
            : null;
      } catch (error) {
        if (!error.message.startsWith("404 Not Found")) throw error;
      }

      console.log({ response });
      const requestData = response
        ? Object.keys(response).reduce((newObj, key) => {
            newObj[camelToSnakeCase(key)] = response[key];
            return newObj;
          }, {})
        : null;
      setExistingRequestData(requestData);
    };

    asyncFunction();
  }, [user, studyAccessApi, props.location]);

  return (
    <AccessRequestViewInner
      {...props}
      existingRequestData={existingRequestData}
    />
  );
};

class AccessRequestViewInner extends Component {
  constructor(...args) {
    super(...args);

    this.renderTitle = this.renderTitle.bind(this);
    this.renderContent = this.renderContent.bind(this);
    this.renderAccessRequestForm = this.renderAccessRequestForm.bind(this);
  }

  renderTitle() {
    const {
      formTitle,
      successfullySubmitted,
      alreadyRequested,
      existingRequestData,
    } = this.props;

    if (successfullySubmitted) {
      return <h1>Data Access Request Submitted</h1>;
    } else if (alreadyRequested || existingRequestData) {
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
      alreadyRequested,
      webAppUrl,
      formValues,
      existingRequestData,
    } = this.props;
    const studyPageUrl = webAppUrl + '/app/record/dataset/' + datasetId;

    if (successfullySubmitted && (requestNeedsApproval!="0")) {
      return (
        <Fragment>
          <p>
            Your data access request has been submitted. We will contact you if any additional information is needed. Please <a href={`${webAppUrl}/app/contact-us`} target="_blank">contact us</a> with any questions.
          </p>
        </Fragment>
      );
    } else if (successfullySubmitted && (requestNeedsApproval=="0")) {
      return (
        <Fragment>
          <p>
          Thank you for submitting your data access registration. You may go to the <a href={`${studyPageUrl}`}>study page</a> to download the data files.
          </p>
        </Fragment>
      );
    } else if (alreadyRequested || existingRequestData) {
      return (
        <Fragment>
          <p>
            Our records indicate that you have already submitted a request for this dataset. If you have any questions about the status of your request, please don't hesitate to <a href={`${webAppUrl}/app/contact-us`} target="_blank">contact us</a>. 
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
      location,
      alreadyRequested,
      existingRequestData,
    } = this.props;
 
   // probably better: offer datasetId in props to avoid this
    const indexOfFirst = location.pathname.toString().indexOf('/DS_') + 1;
    const datasetId = location.pathname.toString().slice(indexOfFirst);

    return (
      <Fragment>
        <h4 className="access-request-form-header">
          Data files will be available to download in a tab-delimited format with an additional data dictionary file. To process your download request, the data providers for this study require documentation of the following information.
          <br/><br/>
          To ensure transparency and promote collaboration within the wider scientific community, your name, organization, date of request and purpose for which the data will be used, as submitted below, will appear publicly on the corresponding  <a href={`${webAppUrl}/app/record/dataset/${datasetId}#AccessRequest`}>study page</a> after a request has been granted. The dataset page also contains critical methodologic information and study findings that are necessary to interpret the requested study data. 
          <br/><br/>
          If you have any questions about a data access request please contact us at <a href={`${webAppUrl}/app/contact-us`}>help@clinepidb.org</a>.
        </h4>
        <form 
          onSubmit={e => {
            e.preventDefault();
            submitForm();
          }}>
          <table align="left">
            <tbody>
              {fieldElements.map(({ key, FieldComponent, label, onChangeKey }) => 
                <FieldComponent
                  key={key}
                  mykey={key}
                  label={label}
                  value={
                    existingRequestData &&
                    existingRequestData.hasOwnProperty(key)
                      ? existingRequestData[key]
                      : formValues[key]
                  }
                  onChange={this.props[onChangeKey]}
                  disabled={alreadyRequested || existingRequestData} />
              )}
              <tr>
                <td colSpan={4}>
                  <div>
                    <em>
                      Note: if there is a discrepancy with your personal information, please <Link to="/user/profile">update your profile</Link>.
                    </em>
                  </div>
                </td>
              </tr>
              <tr>
                <td colSpan={4}>
                  <input
                    type="submit"
                    disabled={disableSubmit || existingRequestData}
                    value="Submit"
                  />
                </td>
              </tr>
              {
                submissionError &&
                <tr>
                  <td colSpan={4}>
                    The following error was reported when we tried to submit your request. 
                    If it persists, please don't hesitate to <a href={`${webAppUrl}/app/contact-us`} target="_blank">contact us</a> for help:

                    <p>
                      {submissionError}
                    </p>
                  </td>
                </tr>
              }
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
