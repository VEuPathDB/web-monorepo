import { PropTypes } from 'react';

export default function GalaxySignUp(props) {
  let { onGalaxyNavigate } = props;
  return (
    <div id="eupathdb-GalaxyTerms">
      <h1>Analyze My Experiment</h1>

      <p>
        The first time you visit EuPathDB Galaxy you will be asked to sign up
        with <a href="https://www.globus.org">Globus</a>, EuPathDB’s Galaxy
        instance manager. This is a three-step sign-up process (screenshots
        below).
      </p>

      <p>
        Click <strong>“Continue to Galaxy”</strong> to sign up for EuPathDB
        Galaxy services.
      </p>

      <p>
        <a href="contact-us">Contact us</a> if you experience any difficulties.
      </p>

      <div id="eupathdb-GalaxyTerms-initial">
        <span className="column-left" >
          <img title="Option to link an existing Globus Account" src="/a/wdkCustomization/images/globus-02-link-account.jpg"/>
          <p>
            (1) If you already have a Globus account, you can link it to
            your EuPathDB account. <strong>Your choice.</strong> If you
            don't have a prior Globus account, choose <strong>No Thanks</strong>.
          </p>
        </span>
        <span className="column-center">
          <img title="Agree to Globus account terms" src="/a/wdkCustomization/images/globus-03-account-terms.jpg"/>
          <p>
            (2) Complete your account information and agree to Globus's
            Terms and Conditions. Please read, make your selections, and click <strong>Continue</strong>.
          </p>
        </span>
        <span className="column-right">
          <img title="Grant permission to access your Globus account" src="/a/wdkCustomization/images/globus-04-oauth-perms.jpg"/>
          <p>
            (3) Grant permission to share your Globus identity and files
            with us. Please click <strong>Allow</strong>. (We will only perform file transfers that you explicitly request, between Galaxy and other resources, including EuPathDB.)
          </p>
        </span>
      </div>

      <div className="eupathdb-GalaxyTermsContinueLink">
        <a href="https://eupathdb.globusgenomics.org"
          target="_blank"
          className="eupathdb-BigButton"
          onClick={onGalaxyNavigate}
        >Continue to Galaxy</a>
      </div>
    </div>
  );
}

GalaxySignUp.propTypes = {
  onGalaxyNavigate: PropTypes.func.isRequired
};
