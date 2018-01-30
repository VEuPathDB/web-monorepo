import React from 'react';
import PropTypes from 'prop-types';

import './DataRestrictionModal.scss';
import { IconAlt as Icon } from 'wdk-client/Components';
import { getPolicyUrl, isActionStrict, getRestrictionMessage, actionRequiresApproval } from 'Client/App/DataRestriction/DataRestrictionUtils';
import Modal from 'Client/App/Modal';

class DataRestrictionModal extends React.Component {
  constructor (props) {
    super(props);
    this.renderButtons = this.renderButtons.bind(this);
    this.renderPolicyNotice = this.renderPolicyNotice.bind(this);
    this.renderRestrictionMessage = this.renderRestrictionMessage.bind(this);
  }

  renderPolicyNotice () {
    const { study, webAppUrl } = this.props;
    const policyUrl = getPolicyUrl(study, webAppUrl);
    return !policyUrl ? null : (
      <p>
        The data from this study requires approval to download and use in research projects.
        Please read the <a href={policyUrl} target="_blank">{study.name} Data Access and Use Policy.</a>
      </p>
    );
  }

  renderRestrictionMessage () {
    const { study, action } = this.props;
    const message = getRestrictionMessage({ study, action });
    return (
      <div>
        <h2>The {study.name} study has data access restrictions.</h2>
        <hr />
        <p>{message}</p>
      </div>
    );
  }

  renderButtons () {
    const { action, study, user, showLoginForm, onClose, webAppUrl } = this.props;
    const strict = isActionStrict(action);
    const approvalRequired = actionRequiresApproval({ action, study });
    return (
      <div className="DataRestrictionModal-Buttons">
        {!user.isGuest ? null : (
          <button onClick={() => showLoginForm(window.location.href)} className="btn">
            Log In
            <Icon fa="sign-in right-side" />
          </button>
        )}
        {!approvalRequired ? null : (
          <a href={webAppUrl + '/contact.do'}>
            <button className="btn">
              Contact Us for Approval
              <Icon fa="envelope-open-o right-side" />
            </button>
          </a>
        )}
        {!strict
          ? (
            <button className="btn" onClick={onClose}>
              Dismiss
              <Icon fa="times right-side" />
            </button>
          )
          : (
            <a href="/" title="Go Home">
              <button className="btn">
                Return to Home Page
                <Icon fa="home right-side" />
              </button>
            </a>
          )
        }
      </div>
    )
  }

  render () {
    const { when, study, action } = this.props;

    const PolicyNotice = this.renderPolicyNotice;
    const Message = this.renderRestrictionMessage;
    const Buttons = this.renderButtons;

    const modalProps = {
      when,
      className: 'DataRestrictionModal',
      wrapperClassName: isActionStrict(action) ? 'DataRestrictionModal-Wrapper' : ''
    };

    return !study ? null : (
      <Modal {...modalProps}>
        <Message/>
        <PolicyNotice/>
        <Buttons/>
      </Modal>
    );
  }
};

DataRestrictionModal.propTypes = {
  user: PropTypes.object.isRequired,
  study: PropTypes.object.isRequired,
  action: PropTypes.string.isRequired,
  when: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  showLoginForm: PropTypes.func.isRequired,
  webAppUrl: PropTypes.string.isRequired
};

export default DataRestrictionModal;
