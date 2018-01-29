import React from 'react';

import './DataRestrictionModal.scss';
import { IconAlt as Icon } from 'wdk-client/Components';
import Modal from 'Client/App/Modal';

class DataRestrictionModal extends React.Component {
  render () {
    const { when, study, onClose, message, directive, showLoginForm, webAppUrl } = this.props;
    const showLogin = () => showLoginForm(window.location.href);
    const policyUrl = !study
      ? null
      : study.policyUrl
        ? study.policyUrl
        : study.policyAppUrl
          ? webAppUrl + study.policyAppUrl
          : null;

    return !study ? null : (
      <Modal className="DataRestrictionModal" when={when}>
        <h2>The {study.name} study has data access restrictions.</h2>
        <hr />
        <p>{message}</p>
        {!policyUrl ? null : (
          <p>
            The data from this study requires approval to download and use in research projects.
            Please read the <a href={policyUrl} target="_blank">{study.name} Data Access and Use Policy.</a>
          </p>
        )}
        <div className="DataRestrictionModal-Buttons">
          {(directive && directive === 'login') || (directive && directive === 'approval')
            ? (
              <button onClick={showLogin} className="btn">
                Log In
                <Icon fa="sign-in right-side" />
              </button>
            ) : null
          }

          {directive && directive === 'approval'
            ? (
              <a href={webAppUrl + '/contact.do'}>
                <button className="btn">
                  Contact Us for Approval
                  <Icon fa="envelope-open-o right-side" />
                </button>
              </a>
            ) : null
          }

          <button className="btn" onClick={onClose}>
            Dismiss
            <Icon fa="times right-side" />
          </button>
        </div>
      </Modal>
    );
  }
};

export default DataRestrictionModal;
