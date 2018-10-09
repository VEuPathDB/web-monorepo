import { Component, Fragment } from 'react';

import { Link } from 'wdk-client/Components'

import { 
  SupportFormBase, 
  SupportFormBody
} from 'ebrc-client/components';

export default class AccessRequestView extends Component {
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
      alreadyRequested
    } = this.props;

    if (successfullySubmitted) {
      return <h1>Data Access Request Submitted</h1>;
    } else if (alreadyRequested) {
      return <h1>Data Access Request Already In Progress</h1>;
    } else {
      return <h1>{formTitle}</h1>;
    }
  }

  renderContent() {
    const AccessRequestForm = this.renderAccessRequestForm;
    const {
      successfullySubmitted,
      alreadyRequested,
      webAppUrl
    } = this.props;

    if (successfullySubmitted) {
      return (
        <Fragment>
          <p>
            We have submitted your request to the data provider.
          </p>
          <p>
          Somebody will follow up with you if any clarification is needed.
          </p>
        </Fragment>
      );
    } else if (alreadyRequested) {
      return (
        <Fragment>
          <p>
            Our records indicate that you have already submitted a request for this dataset. 
          </p>
          <p>
            If you have any questions about the status of your request, please don't hesitate to <a href={`${webAppUrl}/contact.do`} target="_blank">contact us</a>. 
          </p>
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
      webAppUrl
    } = this.props;

    return (
      <Fragment>
        <h4 className="access-request-form-header">
          To process your request, the data provider for this study needs a little more information.
          <br/>Be aware that your NAME,ORGANIZATION,DATE,PURPOSE will appear publicly on the study page after a request has been approved.
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
                  label={label}
                  value={formValues[key]}
                  onChange={this.props[onChangeKey]} />
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
                  <input type="submit" disabled={disableSubmit} value="Submit" />
                </td>
              </tr>
              {
                submissionError &&
                <tr>
                  <td colSpan={4}>
                    The following error was reported when we tried to submit your request. 
                    If it persists, please don't hesitate to <a href={`${webAppUrl}/contact.do`} target="_blank">contact us</a> for help:

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
