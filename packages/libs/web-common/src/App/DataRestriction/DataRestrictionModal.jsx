import React from 'react';
import PropTypes from 'prop-types';

import { getRequestNeedsApproval, getPolicyUrl, isPrereleaseStudy, isActionStrict, getRestrictionMessage, actionRequiresApproval } from 'ebrc-client/App/DataRestriction/DataRestrictionUtils';
import Modal from 'ebrc-client/App/Modal';
import { IconAlt as Icon, Link } from '@veupathdb/wdk-client/lib/Components';
import { safeHtml } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';

import './DataRestrictionModal.scss';

class DataRestrictionModal extends React.Component {
  constructor (props) {
    super(props);
    this.renderRestrictionMessage = this.renderRestrictionMessage.bind(this);
    this.renderPolicyNotice = this.renderPolicyNotice.bind(this);
    this.renderButtons = this.renderButtons.bind(this);
  }

  renderRestrictionMessage () {
    const { study, user, permissions, webAppUrl } = this.props;
    const studyPageUrl = webAppUrl + '/app' + study.route;
    return (isPrereleaseStudy(study.access, study.id, user, permissions))
      ? (
        <div>
          <h2>The {safeHtml(study.name)} study is not yet publicly available.</h2>
          <hr />
          <p>Please see the <a href={studyPageUrl}>{safeHtml(study.name)} study page</a> to learn more about the study and how to request access to the data.</p>
        </div>
        ) 
      : (
        <div>
          <h2>The {safeHtml(study.name)} study has data access restrictions.</h2>
          <hr />
        </div>
        );
  }

  renderPolicyNotice () {
    const { study, user, permissions, action, webAppUrl } = this.props;
    const message = getRestrictionMessage({ study, action });
    const policyUrl = getPolicyUrl(study, webAppUrl);
    return (isPrereleaseStudy(study.access, study.id, user, permissions))
      ? null
      : !policyUrl
        ? null
        : (getRequestNeedsApproval(study)=="0")
          ? (
            <p>
              {message} Data access will be granted immediately upon request submission.
              <br /><br />Please read the <a href={policyUrl} target="_blank"> Data Access and Use Policy.</a>
            </p>
            )
          : (
            <p>
              {message} The data from this study requires approval to download and use in research projects.
              <br /><br />Please read the <a href={policyUrl} target="_blank"> Data Access and Use Policy.</a>
            </p>
            )
    ;
  }

  renderButtons () {
    const { action, study, user, permissions, showLoginForm, onClose, webAppUrl } = this.props;
    const strict = isActionStrict(action);
    const approvalRequired = actionRequiresApproval({ action, study });
    return (isPrereleaseStudy(study.access, study.id, user, permissions))
      ? (
        <div className="DataRestrictionModal-Buttons">
          {!strict
          ? (
            <button className="btn" onClick={onClose}>
              Dismiss
              <Icon fa="times right-side" />
            </button>
          )
          : window.history.length > 1 
            ? (
              <button className="btn" title="Go Back" type="button" onClick={() => window.history.go(-1)}>
                Go Back
                <Icon fa="long-arrow-left right-side" />
              </button>
            )
            : (
              <Link className="btn" to="/" title="Go Home">
                Go Home
                <Icon fa="home right-side" />
              </Link>
            )
          }
        </div>
        ) 
      : (
        <div className="DataRestrictionModal-Buttons">
          {!user.isGuest ? null : (
            <button onClick={() => showLoginForm(window.location.href)} className="btn">
              Log In
              <Icon fa="sign-in right-side" />
            </button>
          )}
        {!approvalRequired ? null : (
          <button onClick={() => {
            const loggedInUrl = `${webAppUrl}/app/request-access/${study.id}?redirectUrl=${encodeURIComponent(window.location.href)}`;

            if (user.isGuest) {
              showLoginForm(loggedInUrl);
            } else {
              window.location.assign(loggedInUrl);
            }
          }} className="btn">
            Submit Data Access Request
            <Icon fa="envelope-open-o right-side" />
          </button>
        )}
        {!strict
          ? (
            <button className="btn" onClick={onClose}>
              Dismiss
              <Icon fa="times right-side" />
            </button>
          )
          : strict && window.history.length > 1
            ? (
              <button className="btn" title="Go Back" type="button" onClick={() => window.history.go(-1)}>
                Go Back
                <Icon fa="long-arrow-left right-side" />
              </button>
            )
            : (
              <Link className="btn" to="/" title="Go Home">
                Go Home
                <Icon fa="home right-side" />
              </Link>
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
  permissions: PropTypes.object.isRequired,
  study: PropTypes.object.isRequired,
  action: PropTypes.string.isRequired,
  when: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  showLoginForm: PropTypes.func.isRequired,
  webAppUrl: PropTypes.string.isRequired
};

export default DataRestrictionModal;
