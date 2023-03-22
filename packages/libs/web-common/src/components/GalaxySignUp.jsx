import PropTypes from 'prop-types';
import React from 'react';
import GalaxyPageLayout from './GalaxyPageLayout';
import linkAccount from '../../images/globus-02-link-account.png';
import accountTerms from '../../images/globus-03-account-terms.png';
import oauthPerms from '../../images/globus-04-oauth-perms.png';

/**
 * Sign up page
 */
export default function GalaxySignUp(props) {
  let { onGalaxyNavigate, securityAgreementStatus, updateSecurityAgreementStatus, webAppUrl } = props;
  return (
    <GalaxyPageLayout>
      <p>
        The first time you visit VEuPathDB Galaxy you will be asked to sign up with Globus, VEuPathDB’s Galaxy manager,
        in order to set up your private Galaxy workspace. This is a three-step sign-up process (screenshots below),
        which will be opened in a new tab.
      </p>

      <p>
        <a href={`${webAppUrl}/app/contact-us`} target="_blank">Contact us</a> if you experience any difficulties.
      </p>

      <div className="eupathdb-GalaxySignUpScreens">
        <div>
          <div className="eupathdb-GalaxySignUpScreenHeader">
            <strong>1. Create new or link existing Globus account.</strong>
          </div>
          <img title="Option to link an existing Globus Account" src={linkAccount}/>
          <div className="eupathdb-GalaxySignUpScreenCaption">
            If you already have a Globus account, you may choose to link it to
            your VEuPathDB account. If you don't have an existing Globus account,
            choose <strong>Continue</strong>.
          </div>
        </div>
        <div>
          <div className="eupathdb-GalaxySignUpScreenHeader">
            <strong>2. Register your credentials.</strong>
          </div>
          <img title="Agree to Globus account terms" src={accountTerms}/>
          <div className="eupathdb-GalaxySignUpScreenCaption">
            Tell Globus how you will use your account, read and agree to their
            Terms and Conditions, then click <strong>Continue</strong>
          </div>
        </div>
        <div>
          <div className="eupathdb-GalaxySignUpScreenHeader">
            <strong>3. Grant VEuPathDB Galaxy access to your account.</strong>
          </div>
          <img title="Grant permission to access your Globus account" src={oauthPerms}/>
          <div className="eupathdb-GalaxySignUpScreenCaption">
            Click <strong>Allow</strong> to grant permission to share the
            account with us. We will only perform file transfers that you explicitly request.
          </div>
        </div>
      </div>

      <div className="eupathdb-GalaxyTermsContinueLink">
        <p style={{ fontSize: 'small', textAlign: 'justify' }}>
          VEuPathDB Galaxy workspaces are provided free of charge. Note that data will be purged after 60 days of inactivity. We encrypt data transfers and storage but ultimately, we cannot guarantee the security of data transmissions between VEuPathDB, Globus and affiliates, Amazon Cloud Services, and the user. It is your responsibility to back up your data and obtain any required permissions from your study and/or institution prior to uploading data for analyses on the VEuPathDB Galaxy platform. Do not use, transmit, upload or share any human identifiable information in the files you analyze. VEuPathDB, the multiple universities responsible for providing this resource, Globus and affiliates, and Amazon Cloud Services are not responsible or liable for the loss and/or release of any data you analyze via the VEuPathDB Galaxy platform.
        </p>
        <p style={{fontSize: 'small'}}>
          <label>
            <input
              type="checkbox"
              checked={securityAgreementStatus}
              onClick={e => updateSecurityAgreementStatus(e.target.checked)}
            />
            <strong> I have read and understand the information above.</strong>
          </label>
        </p>
        <button
          className="eupathdb-BigButton"
          onClick={onGalaxyNavigate}
          disabled={!securityAgreementStatus}
          title={securityAgreementStatus
            ? 'Open Galaxy in a new tab/window.'
            : 'Please read and agree to the information below.'}
        >Continue to Galaxy</button>
      </div>
    </GalaxyPageLayout>
  );
}

GalaxySignUp.propTypes = {
  onGalaxyNavigate: PropTypes.func.isRequired,
  updateSecurityAgreementStatus: PropTypes.func.isRequired,
  securityAgreementStatus: PropTypes.bool.isRequired
};
