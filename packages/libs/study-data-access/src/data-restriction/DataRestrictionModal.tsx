import React from 'react';
import { useHistory } from 'react-router-dom';
import { parsePath } from 'history';

import {
  getRequestNeedsApproval,
  getPolicyUrl,
  isPrereleaseStudy,
  isActionStrict,
  getRestrictionMessage,
  actionRequiresApproval,
} from './DataRestrictionUtils';
import Modal from '@veupathdb/wdk-client/lib/Components/Overlays/Modal';
import { IconAlt as Icon, Link } from '@veupathdb/wdk-client/lib/Components';
import { Tooltip } from '@veupathdb/coreui';
import { safeHtml } from '@veupathdb/wdk-client/lib/Utils/ComponentUtils';
import { getStudyAccess, getStudyId, getStudyName } from '../shared/studies';

import './DataRestrictionModal.scss';
import { User } from '@veupathdb/wdk-client/lib/Utils/WdkUser';
import { UserPermissions } from '../study-access/permission';
import { RecordInstance } from '@veupathdb/wdk-client/lib/Utils/WdkModel';

interface Props {
  user: User;
  permissions: UserPermissions;
  study: RecordInstance;
  action: string;
  when: boolean;
  onClose: () => void;
  showLoginForm: (destination: string) => void;
  makeStudyPageRoute: (studyId: string) => string;
}

export default function DataRestrictionModal(props: Props) {
  const { when, study, action } = props;

  const modalProps = {
    when,
    className: 'DataRestrictionModal',
    wrapperClassName: isActionStrict(action)
      ? 'DataRestrictionModal-Wrapper'
      : '',
  };

  return !study ? null : (
    <Modal {...modalProps}>
      <Message {...props} />
      <PolicyNotice {...props} />
      <Buttons {...props} />
    </Modal>
  );
}

function Message(props: Props) {
  const { study, user, permissions, makeStudyPageRoute } = props;
  const studyId = getStudyId(study);
  const studyName = getStudyName(study);
  if (studyId == null || studyName == null) {
    const errorMessage = 'Could not get study ID or name for study.';
    console.error(errorMessage, { study });
    throw new Error(errorMessage);
  }
  const studyPageUrl = makeStudyPageRoute(studyId);
  return isPrereleaseStudy(
    getStudyAccess(study),
    getStudyId(study),
    permissions
  ) ? (
    <div>
      <h2>The {safeHtml(studyName)} study is not yet publicly available.</h2>
      <hr />
      <p>
        Please see the{' '}
        <Link to={studyPageUrl}>{safeHtml(studyName)} study page</Link> to learn
        more about the study and how to request access to the data.
      </p>
    </div>
  ) : (
    <div>
      <h2>The {safeHtml(studyName)} study has data access restrictions.</h2>
      <hr />
    </div>
  );
}

function PolicyNotice(props: Props) {
  const { study, user, permissions, action } = props;
  const message =
    action === 'download'
      ? 'This study requires you to submit an access request'
      : getRestrictionMessage({ action, permissions, study, user });
  const policyUrl = getPolicyUrl(study);
  return isPrereleaseStudy(
    getStudyAccess(study),
    getStudyId(study),
    permissions
  ) ? null : !policyUrl ? null : getRequestNeedsApproval(study) == '0' ? (
    <p>
      {message}. Data access will be granted immediately upon request
      submission.
      <br />
      <br />
      Please read the{' '}
      <Link to={policyUrl} target="_blank" rel="noreferrer">
        {' '}
        Data Access and Use Policy.
      </Link>
    </p>
  ) : (
    <p>
      {message} and get approval from the study team before downloading data.
      <br />
      <br />
      Please read the{' '}
      <Link to={policyUrl} target="_blank" rel="noreferrer">
        {' '}
        Data Access and Use Policy.
      </Link>
    </p>
  );
}

function Buttons(props: Props) {
  const { action, study, user, permissions, showLoginForm, onClose } = props;
  const history = useHistory();
  const strict = isActionStrict(action);
  const approvalRequired = actionRequiresApproval({
    action,
    permissions,
    study,
    user,
  });
  const loggedInRoute = `/request-access/${getStudyId(
    study
  )}?redirectUrl=${encodeURIComponent(window.location.href)}`;
  const loginFormRedirect =
    window.location.origin + history.createHref(parsePath(loggedInRoute));

  const submitDataAccessButton = (
    <button
      onClick={() => {
        if (user.isGuest) {
          showLoginForm(loginFormRedirect);
        } else {
          history.push(loggedInRoute);
        }
      }}
      className="btn"
      disabled={user.isGuest}
    >
      Submit Data Access Request
      <Icon fa="envelope-open-o right-side" />
    </button>
  );

  return isPrereleaseStudy(
    getStudyAccess(study),
    getStudyId(study),
    permissions
  ) ? (
    <div className="DataRestrictionModal-Buttons">
      {!strict ? (
        <button className="btn" onClick={onClose}>
          Dismiss
          <Icon fa="times right-side" />
        </button>
      ) : window.history.length > 1 ? (
        <button
          className="btn"
          title="Go Back"
          type="button"
          onClick={() => window.history.go(-1)}
        >
          Go Back
          <Icon fa="long-arrow-left right-side" />
        </button>
      ) : (
        <Link className="btn" to="/" title="Go Home">
          Go Home
          <Icon fa="home right-side" />
        </Link>
      )}
    </div>
  ) : (
    <div className="DataRestrictionModal-Buttons">
      {!user.isGuest ? null : (
        <button
          onClick={() => showLoginForm(loginFormRedirect)}
          className="btn"
        >
          Log In
          <Icon fa="sign-in right-side" />
        </button>
      )}
      {!approvalRequired ? null : user.isGuest ? (
        <Tooltip
          title={'You must be logged in to request data access'}
          enterDelay={0}
        >
          {submitDataAccessButton}
        </Tooltip>
      ) : (
        submitDataAccessButton
      )}
      {!strict ? (
        <button className="btn" onClick={onClose}>
          Dismiss
          <Icon fa="times right-side" />
        </button>
      ) : strict && window.history.length > 1 ? (
        <button
          className="btn"
          title="Go Back"
          type="button"
          onClick={() => window.history.go(-1)}
        >
          Go Back
          <Icon fa="long-arrow-left right-side" />
        </button>
      ) : (
        <Link className="btn" to="/" title="Go Home">
          Go Home
          <Icon fa="home right-side" />
        </Link>
      )}
    </div>
  );
}
